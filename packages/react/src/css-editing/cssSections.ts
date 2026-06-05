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
export type SectionKey = { type: 'element' } | { type: 'part'; name: string };

export function selectorOf(section: SectionKey): string {
  if (section.type === 'element') return ':host';
  return `::part(${section.name})`;
}

export type CssDimension = { value: string; unit: string };

export type ShorthandDimensions = {
  top: CssDimension | null;
  right: CssDimension | null;
  bottom: CssDimension | null;
  left: CssDimension | null;
};

export type ReadSectionOptions = {
  property?: string;
  exclude?: RegExp[];
};

/**
 * Reads the declarations of the rule that matches `section` if a property is not specified, formatted as a
 * CSS declaration block string (e.g. `color: red;\npadding: 10px`). If a property is specified, returns the value of that property.
 * Returns "" if no matching rule or property exists.
 */
export function readSection(
  css: string,
  section: SectionKey,
  options?: ReadSectionOptions
): string {
  const { property, exclude } = options ?? {};
  if (!css.trim()) return '';
  let ast: any;
  try {
    ast = cssParser(css);
  } catch {
    return '';
  }
  const rule = findMatchingRule(ast, section);
  if (!rule) return '';
  if (property) {
    const decl = findDeclaration(rule, property);
    return decl && decl.value ? cssSerializer(decl.value) : '';
  }
  return serializeDeclarations(rule.block, exclude);
}

export function readSectionShorthandDimension(
  css: string,
  section: SectionKey,
  property: string
): ShorthandDimensions {
  const nil: ShorthandDimensions = {
    top: null,
    right: null,
    bottom: null,
    left: null,
  };
  if (!css.trim()) return nil;
  let ast: any;
  try {
    ast = cssParser(css);
  } catch {
    return nil;
  }
  const rule = findMatchingRule(ast, section);
  if (!rule) return nil;

  const shorthandDecl = findDeclaration(rule, property);
  const result = { ...nil };

  if (shorthandDecl) {
    const values = (shorthandDecl.value?.children ?? []).filter(
      (n: any) => n.type !== 'WhiteSpace'
    );
    const dims = values.map(nodeToDimension);

    if (dims.length === 1) {
      result.top = result.right = result.bottom = result.left = dims[0];
    } else if (dims.length === 2) {
      result.top = result.bottom = dims[0];
      result.right = result.left = dims[1];
    } else if (dims.length === 3) {
      result.top = dims[0];
      result.right = result.left = dims[1];
      result.bottom = dims[2];
    } else if (dims.length >= 4) {
      result.top = dims[0];
      result.right = dims[1];
      result.bottom = dims[2];
      result.left = dims[3];
    }
  }

  const sides = ['top', 'right', 'bottom', 'left'] as const;
  for (const side of sides) {
    const longhand = findDeclaration(rule, `${property}-${side}`);
    if (longhand) {
      const val = nodeToDimension(longhand.value?.children?.[0]);
      if (val) result[side] = val;
    }
  }

  return result;
}

function nodeToDimension(node: any): CssDimension | null {
  if (!node) return null;
  if (node.type === 'Dimension') return { value: node.value, unit: node.unit };
  if (node.type === 'Percentage') return { value: node.value, unit: '%' };
  return null;
}

/**
 * Returns a new CSS string with the declarations of the rule matching
 * `section` replaced by `declarations`. If no matching rule exists, appends
 * a new rule. If `declarations` is empty / whitespace, removes the matching
 * rule entirely. Other rules are preserved unchanged.
 *
 * When `preserve` is provided, any existing declarations whose property name
 * matches one of the patterns are kept in the block even if they are absent
 * from the incoming `declarations`. This lets a partial editor (e.g. an
 * "advanced CSS" textarea that deliberately hides managed properties) write
 * freely without accidentally wiping those managed values.
 */
export function writeSection(
  css: string,
  section: SectionKey,
  declarations: string,
  preserve: RegExp[] = []
): { css: string; conflict: boolean } {
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

  if (trimmed.length === 0 && preserve.length === 0) {
    if (existingIdx >= 0) ast.children.splice(existingIdx, 1);
    return { css: cssSerializer(ast), conflict: false };
  }

  const newBlock =
    trimmed.length > 0
      ? parseDeclarationBlock(trimmed)
      : { type: 'Block', children: [] as any[] };
  if (!newBlock) return { css, conflict: false };

  const conflict = identifyAndFilterConflicts(newBlock, preserve);

  if (preserve.length > 0 && existingIdx >= 0) {
    const existingBlock = ast.children[existingIdx].block;
    if (existingBlock && Array.isArray(existingBlock.children)) {
      const preservedDecls = existingBlock.children.filter(
        (d: any) =>
          d.type === 'Declaration' &&
          typeof d.property === 'string' &&
          preserve.some(regex => regex.test(d.property))
      );
      newBlock.children = [...preservedDecls, ...newBlock.children];
    }
  }

  if (newBlock.children.length === 0 && trimmed.length === 0) {
    if (existingIdx >= 0) ast.children.splice(existingIdx, 1);
    return { css: cssSerializer(ast), conflict };
  }

  if (existingIdx >= 0) {
    ast.children[existingIdx] = {
      ...ast.children[existingIdx],
      block: newBlock,
    };
  } else {
    ast.children.push(buildRule(section, newBlock));
  }
  return { css: cssSerializer(ast), conflict };
}

function identifyAndFilterConflicts(block: any, preserve: RegExp[]): boolean {
  if (!block || !Array.isArray(block.children)) return false;
  let conflict = false;
  const filteredBlock = block.children.filter((d: any) => {
    if (
      !(
        d.type === 'Declaration' &&
        typeof d.property === 'string' &&
        preserve.some(regex => regex.test(d.property))
      )
    ) {
      return true;
    } else {
      conflict = true;
      return false;
    }
  });
  block.children = filteredBlock;
  return conflict;
}

export function writeSectionProperty(
  css: string,
  section: SectionKey,
  property: string,
  value: string
): string {
  const current = readSection(css, section);

  // Parse existing declarations into a block AST
  let block: any = current.trim()
    ? parseDeclarationBlock(current)
    : parseDeclarationBlock('');
  if (!block) block = { type: 'Block', children: [] };

  const declIdx = block.children.findIndex(
    (d: any) => d.type === 'Declaration' && d.property === property
  );

  if (value.trim().length === 0) {
    // Remove property
    if (declIdx >= 0) block.children.splice(declIdx, 1);
  } else {
    // Parse a fresh declaration to get a proper AST node with correct .value
    const freshBlock = parseDeclarationBlock(`${property}: ${value}`);
    const freshDecl = freshBlock?.children?.[0];
    if (!freshDecl) return css;

    if (declIdx >= 0) {
      block.children[declIdx] = freshDecl;
    } else {
      block.children.push(freshDecl);
    }
  }

  const newDeclarations = serializeDeclarations(block);
  return writeSection(css, section, newDeclarations).css;
}

function findMatchingRule(ast: any, section: SectionKey): any | undefined {
  if (!Array.isArray(ast.children)) return undefined;
  return ast.children.find(
    (rule: any) => rule.type === 'Rule' && ruleMatches(rule, section)
  );
}

function findDeclaration(rule: any, property: string): any | undefined {
  return rule.block.children.find(
    (d: any) => d.type === 'Declaration' && d.property === property
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

function serializeDeclarations(block: any, exclude: RegExp[] = []): string {
  if (!block || !Array.isArray(block.children)) return '';
  return block.children
    .map((decl: any) => {
      if (exclude.some(regex => regex.test(decl.property))) return '';
      const fauxBlock = { ...block, children: [decl] };
      const inner = cssSerializer(fauxBlock);
      return inner
        .replace(/^\{/, '')
        .replace(/\}$/, '')
        .trim();
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
