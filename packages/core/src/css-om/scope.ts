// eslint-disable-next-line prettier/prettier
import { CssNodePlain, parse, toPlainObject } from "css-tree";

/**
 * Rewrites every selector in a stylesheet AST so that the rules apply only to
 * the element marked with `data-raisin-id="<scope>"`.
 *
 * - `:host` and `:host(<sel>)` are replaced with the scope's attribute selector
 *   (optionally fused with `<sel>`).
 * - `::part(name)` selectors are prefixed with the scope attribute selector,
 *   so the rule pierces the shadow boundary on the scoped element only.
 * - Bare selectors become descendants of the scope attribute selector.
 *
 * The stylesheet is not parsed or serialized — the caller controls that. The
 * returned AST shares no structural references with the input.
 */
export function scopeStylesheet(
  stylesheet: CssNodePlain,
  scope: string
): CssNodePlain {
  const clone = JSON.parse(JSON.stringify(stylesheet));
  visitRules(clone, (rule: any) => scopeRule(rule, scope));
  return clone;
}

function visitRules(node: any, visit: (rule: any) => void): void {
  if (!node) return;
  if (node.type === "Rule") {
    visit(node);
    return;
  }
  if (Array.isArray(node.children)) {
    node.children.forEach((c: any) => visitRules(c, visit));
  }
  if (node.block) visitRules(node.block, visit);
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
