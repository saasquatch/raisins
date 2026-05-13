/* eslint-disable @typescript-eslint/no-explicit-any */
import { cssParser, cssSerializer } from '@raisins/core';

/**
 * A logical editable section of the per-instance CSS for a single element.
 *
 * - `element`  → the rule whose selector is `:host`
 * - `part(<n>)` → the rule whose selector is `::part(<n>)`
 *
 * Other rules in the CSS (e.g. raw selectors, at-rules) are left untouched by
 * {@link writeSection} — only the matching rule, if any, is rewritten.
 */
export type SectionKey =
  | { type: 'element' }
  | { type: 'part'; name: string };

export function selectorOf(section: SectionKey): string {
  if (section.type === 'element') return ':host';
  return `::part(${section.name})`;
}

/**
 * Reads the declarations of the rule that matches `section`, formatted as a
 * CSS declaration block string (e.g. `color: red;\npadding: 10px`). Returns
 * "" if no matching rule exists.
 */
export function readSection(css: string, section: SectionKey): string {
  if (!css.trim()) return '';
  let ast: any;
  try {
    ast = cssParser(css);
  } catch {
    return '';
  }
  const rule = findMatchingRule(ast, section);
  if (!rule) return '';
  return serializeDeclarations(rule.block);
}

/**
 * Returns a new CSS string with the declarations of the rule matching
 * `section` replaced by `declarations`. If no matching rule exists, appends
 * a new rule. If `declarations` is empty / whitespace, removes the matching
 * rule entirely. Other rules are preserved unchanged.
 */
export function writeSection(
  css: string,
  section: SectionKey,
  declarations: string
): string {
  const trimmed = declarations.trim();
  let ast: any;
  try {
    ast = css.trim() ? cssParser(css) : cssParser('');
  } catch {
    ast = cssParser('');
  }
  if (!Array.isArray(ast.children)) ast.children = [];

  const existingIdx = ast.children.findIndex(
    (rule: any) => rule.type === 'Rule' && ruleMatches(rule, section)
  );

  if (trimmed.length === 0) {
    if (existingIdx >= 0) ast.children.splice(existingIdx, 1);
    return cssSerializer(ast);
  }

  const newBlock = parseDeclarationBlock(trimmed);
  if (!newBlock) return css;

  if (existingIdx >= 0) {
    ast.children[existingIdx] = {
      ...ast.children[existingIdx],
      block: newBlock,
    };
  } else {
    ast.children.push(buildRule(section, newBlock));
  }
  return cssSerializer(ast);
}

function findMatchingRule(ast: any, section: SectionKey): any | undefined {
  if (!Array.isArray(ast.children)) return undefined;
  return ast.children.find(
    (rule: any) => rule.type === 'Rule' && ruleMatches(rule, section)
  );
}

function ruleMatches(rule: any, section: SectionKey): boolean {
  const selectors = rule.prelude?.children;
  if (!Array.isArray(selectors)) return false;
  return selectors.some((sel: any) => selectorMatches(sel, section));
}

function selectorMatches(selector: any, section: SectionKey): boolean {
  if (selector.type !== 'Selector' || !Array.isArray(selector.children)) {
    return false;
  }
  if (selector.children.length !== 1) return false;
  const only = selector.children[0];
  if (section.type === 'element') {
    return (
      only.type === 'PseudoClassSelector' &&
      only.name === 'host' &&
      !only.children
    );
  }
  if (
    only.type !== 'PseudoElementSelector' ||
    only.name !== 'part' ||
    !Array.isArray(only.children)
  ) {
    return false;
  }
  return only.children[0]?.value === section.name;
}

function serializeDeclarations(block: any): string {
  if (!block || !Array.isArray(block.children)) return '';
  return block.children
    .map((decl: any) => {
      const fauxBlock = { ...block, children: [decl] };
      const inner = cssSerializer(fauxBlock);
      return inner.replace(/^\{/, '').replace(/\}$/, '').trim();
    })
    .filter((line: string) => line.length > 0)
    .join(';\n');
}

function parseDeclarationBlock(declarations: string): any | undefined {
  const normalized = declarations.replace(/;\s*$/, '');
  const wrapped = `*{${normalized}}`;
  let ast: any;
  try {
    ast = cssParser(wrapped);
  } catch {
    return undefined;
  }
  const rule = ast.children?.[0];
  if (!rule || rule.type !== 'Rule' || !rule.block) return undefined;
  return rule.block;
}

function buildRule(section: SectionKey, block: any): any {
  const ast: any = cssParser(`${selectorOf(section)}{}`);
  const rule = ast.children[0];
  rule.block = block;
  return rule;
}
