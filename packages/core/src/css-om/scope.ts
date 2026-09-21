// eslint-disable-next-line prettier/prettier
import csstree, { CssNodePlain, parse, toPlainObject } from "css-tree";

/**
 * Rewrites every selector in a stylesheet AST so that the rules apply only to
 * the element marked with `data-raisin-id="<scope>"`.
 *
 * - `:host` and `:host(<sel>)` are replaced with the scope's attribute selector
 *   (optionally fused with `<sel>`).
 * - `::part(name)` selectors are prefixed with the scope attribute selector,
 *   so the rule pierces the shadow boundary on the scoped element only.
 * - Bare selectors become descendants of the scope attribute selector.
 * - Nested rules using `&` (CSS Nesting syntax) are expanded and lifted to the
 *   top level with the parent's scoped selector substituted for `&`.
 *
 * The stylesheet is not parsed or serialized — the caller controls that. The
 * returned AST shares no structural references with the input.
 */
export function scopeStylesheet(
  stylesheet: CssNodePlain,
  scope: string
): CssNodePlain {
  const clone = JSON.parse(JSON.stringify(stylesheet));
  processChildren(clone, scope);
  return clone;
}

/** Keyframe selectors (`from`, `to`, `0%`) are not style rules — scoping them breaks the animation. */
const KEYFRAMES_AT_RULE = /^(-[a-z]+-)?keyframes$/i;

type RuleNode = {
  type: "Rule";
  prelude: CssNodePlain;
  block: { children: CssNodePlain[] };
};

function processChildren(node: any, scope: string): void {
  if (!node || !Array.isArray(node.children)) return;
  const result: any[] = [];
  for (const child of node.children) {
    if (child.type === "Rule") {
      scopeRule(child, scope);
      result.push(...expandRule(child));
    } else {
      const isKeyframes =
        child.type === "Atrule" &&
        typeof child.name === "string" &&
        KEYFRAMES_AT_RULE.test(child.name);
      if (child.block && !isKeyframes) processChildren(child.block, scope);
      result.push(child);
    }
  }
  node.children = result;
}

function expandRule(rule: CssNodePlain): CssNodePlain[] {
  const pending: CssNodePlain[] = [rule];
  const result: CssNodePlain[] = [];

  while (pending.length > 0) {
    const current = pending.pop();
    if (!current) continue;
    if (current.type !== "Rule") {
      result.push(current);
      continue;
    }

    const ruleNode = current as RuleNode;
    const { kept, lifted } = expandNesting(ruleNode);
    if (kept.length > 0) {
      ruleNode.block.children = kept;
      result.push(current);
    }
    for (let index = lifted.length - 1; index >= 0; index -= 1) {
      pending.push(lifted[index]);
    }
  }

  return result;
}

function expandNesting(
  rule: RuleNode
): {
  kept: CssNodePlain[];
  lifted: CssNodePlain[];
} {
  const block = rule.block;
  if (!block || !Array.isArray(block.children)) {
    return { kept: [], lifted: [] };
  }

  const selectorStr = serializeNode(rule.prelude);
  const kept: CssNodePlain[] = [];
  const lifted: CssNodePlain[] = [];

  for (const child of block.children) {
    if (
      child.type === "Raw" &&
      typeof child.value === "string" &&
      child.value.includes("&")
    ) {
      const expanded = replaceNestingSelectorTokens(child.value, selectorStr);
      const parsed = toPlainObject(parse(expanded)) as CssNodePlain & {
        children?: CssNodePlain[];
      };
      if (parsed.type === "StyleSheet" && Array.isArray(parsed.children)) {
        lifted.push(...parsed.children);
      }
    } else {
      kept.push(child);
    }
  }

  return { kept, lifted };
}

/**
 * Replaces only the CSS-nesting `&` selector tokens in a raw (unparsed) rule
 * chunk with `selectorStr`.
 *
 * `&` is tokenized on its own (a Delim token) only when it stands alone as a
 * nesting selector. Anywhere else it is swallowed as part of a larger token
 * (a String, Url, etc.), so scanning tokens and only replacing standalone
 * single-character `&` tokens rewrites just the nesting selector occurrences.
 */
function replaceNestingSelectorTokens(
  raw: string,
  selectorStr: string
): string {
  const csstreeAny = csstree as any;
  const tokenStream = new csstreeAny.TokenStream();
  csstreeAny.tokenize(raw, tokenStream);

  let result = "";
  let cursor = 0;
  let braceDepth = 0;
  tokenStream.forEachToken((_type: number, start: number, end: number) => {
    if (end - start !== 1) return;
    if (braceDepth === 0 && raw.charCodeAt(start) === 38 /* '&' */) {
      result += raw.slice(cursor, start) + selectorStr;
      cursor = end;
    }
    if (raw.charCodeAt(start) === 123 /* '{' */) braceDepth += 1;
    if (raw.charCodeAt(start) === 125 /* '}' */)
      braceDepth = Math.max(0, braceDepth - 1);
  });
  result += raw.slice(cursor);
  return result;
}

function serializeNode(node: any): string {
  return csstree.generate(
    csstree.fromPlainObject(JSON.parse(JSON.stringify(node)))
  );
}

function scopeRule(rule: any, scope: string): void {
  const prelude = rule.prelude;
  if (!prelude || prelude.type !== "SelectorList") return;
  if (!Array.isArray(prelude.children)) return;
  prelude.children = prelude.children.map((sel: any) =>
    scopeSelector(sel, scope)
  );
}

function scopeSelector(selector: any, scope: string): any {
  if (selector.type !== "Selector" || !Array.isArray(selector.children)) {
    return selector;
  }
  const children: any[] = selector.children;
  const first = children[0];
  const rest = children.slice(1);
  const attr = buildAttributeSelector(scope);

  if (first && first.type === "PseudoClassSelector" && first.name === "host") {
    const inner = extractHostInner(first);
    return { ...selector, children: [attr, ...inner, ...rest] };
  }

  if (
    first &&
    first.type === "PseudoElementSelector" &&
    first.name === "part"
  ) {
    return { ...selector, children: [attr, ...children] };
  }

  return {
    ...selector,
    children: [attr, descendantCombinator(), ...children]
  };
}

/**
 * `:host(.foo > div)` stores `.foo > div` as a single Raw child. Parse it
 * back into a Selector and lift its children up so they become a part of the
 * outer selector.
 */
function extractHostInner(host: any): any[] {
  const inner = host.children;
  if (!Array.isArray(inner) || inner.length === 0) return [];
  const innerText = inner[0]?.value;
  if (typeof innerText !== "string" || innerText.length === 0) return [];
  const parsedSelector: any = toPlainObject(
    parse(innerText, { context: "selector" })
  );
  if (
    parsedSelector.type !== "Selector" ||
    !Array.isArray(parsedSelector.children)
  ) {
    return [];
  }
  return parsedSelector.children;
}

function buildAttributeSelector(scope: string): any {
  return {
    type: "AttributeSelector",
    name: { type: "Identifier", name: "data-raisin-id" },
    matcher: "=",
    value: { type: "String", value: `"${scope}"` },
    flags: null
  };
}

function descendantCombinator(): any {
  return { type: "Combinator", name: " " };
}
