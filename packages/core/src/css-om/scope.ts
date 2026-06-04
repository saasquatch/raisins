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

function processChildren(node: any, scope: string): void {
  if (!node || !Array.isArray(node.children)) return;
  const result: any[] = [];
  for (const child of node.children) {
    if (child.type === "Rule") {
      scopeRule(child, scope);
      const { kept, lifted } = expandNesting(child);
      if (kept.length > 0) {
        child.block.children = kept;
        result.push(child);
      }
      result.push(...lifted);
    } else {
      if (child.block) processChildren(child.block, scope);
      result.push(child);
    }
  }
  node.children = result;
}

function expandNesting(rule: any): { kept: any[]; lifted: any[] } {
  const block = rule.block;
  if (!block || !Array.isArray(block.children))
    return { kept: [], lifted: [] };

  const selectorStr = serializeNode(rule.prelude);
  const kept: any[] = [];
  const lifted: any[] = [];

  for (const child of block.children) {
    if (
      child.type === "Raw" &&
      typeof child.value === "string" &&
      child.value.includes("&")
    ) {
      const expanded = child.value.replace(/&/g, selectorStr);
      const parsed: any = toPlainObject(parse(expanded));
      if (parsed.type === "StyleSheet" && Array.isArray(parsed.children)) {
        lifted.push(...parsed.children);
      }
    } else {
      kept.push(child);
    }
  }

  return { kept, lifted };
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
