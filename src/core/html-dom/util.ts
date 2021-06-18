import { ElementType } from 'domelementtype';
import {
  RaisinCommentNode,
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNode,
  RaisinNodeWithChildren,
  RaisinProcessingInstructionNode,
  RaisinStyleNode,
  RaisinTextNode,
} from './RaisinNode';
import cloneDeep from 'lodash.clonedeep';

/**
 * Provides a WeakMap for parent lookups
 *
 * @param root
 */
export function getParents(root: RaisinNode): WeakMap<RaisinNode, RaisinNodeWithChildren> {
  const map = new WeakMap<RaisinNode, RaisinNodeWithChildren>();
  function storeParent(elem: RaisinNodeWithChildren, children?: RaisinNode[]) {
    children.forEach(c => map.set(c, elem));
    return elem;
  }

  visit(root, {
    onCData: storeParent,
    onElement: storeParent,
    onRoot: storeParent,
    onStyle: n => n,
    onComment: n => n,
    onDirective: n => n,
    onText: n => n,
  });
  return map;
}

export function visit<T = unknown>(node: RaisinNode, visitor: Partial<NodeVisitor<T>>, recursive: boolean = true): T {
  let result: T;
  const skip = visitor.skipNode && visitor.skipNode(node);
  if (skip) {
    return;
  }

  switch (node.type) {
    case ElementType.Text:
      result = visitor.onText && visitor.onText(node as RaisinTextNode);
      break;
    case ElementType.Directive: {
      result = visitor.onDirective && visitor.onDirective(node as RaisinProcessingInstructionNode);
      break;
    }
    case ElementType.Comment:
      result = visitor.onComment && visitor.onComment(node as RaisinCommentNode);
      break;
    case ElementType.Tag:
    case ElementType.Script: {
      if (!visitor.onElement) break;
      const element = node as RaisinElementNode;
      const children = recursive && element.children ? element.children.map(c => visit(c, visitor, recursive)).filter(c => c !== undefined) : [];
      result = visitor.onElement(element, children);
      break;
    }
    case ElementType.Style: {
      if (!visitor.onStyle) break;
      const element = node as RaisinStyleNode;
      result = visitor.onStyle(element);
      break;
    }
    case ElementType.CDATA: {
      if (!visitor.onCData) break;
      const cdata = node as RaisinNodeWithChildren;
      const children = recursive && cdata.children ? cdata.children.map(c => visit(c, visitor, recursive)).filter(c => c !== undefined) : [];
      result = visitor.onCData(cdata, children);
      break;
    }
    case ElementType.Root: {
      if (!visitor.onRoot) break;
      const root = node as RaisinDocumentNode;
      const children = recursive && root.children ? root.children.map(c => visit(c, visitor, recursive)).filter(c => c !== undefined) : [];
      result = visitor.onRoot(root, children);
      break;
    }
    case ElementType.Doctype: {
      // This type isn't used yet.
      throw new Error('Not implemented yet: ElementType.Doctype case');
    }
  }
  return result;
}

/**
 * A depth-first visitor that will visit the deepest children first
 */
export interface NodeVisitor<T> {
  skipNode?(node: RaisinNode): boolean;
  onText(text: RaisinTextNode): T | undefined;
  onStyle(element: RaisinStyleNode): T | undefined;
  onElement(element: RaisinElementNode, children?: T[]): T | undefined;
  onRoot(node: RaisinDocumentNode, children?: T[]): T | undefined;

  onDirective(directive: RaisinProcessingInstructionNode): T | undefined;
  onComment(comment: RaisinCommentNode): T | undefined;
  onCData(element: RaisinNodeWithChildren, children?: T[]): T | undefined;
}

/**
 * Returns a clone of `root` with `node` removed.
 *
 * @param root
 * @param node
 */
export function remove(root: RaisinNode, node: RaisinNode): RaisinNode {
  return freeze(
    visit(root, {
      skipNode(n) {
        return n === node;
      },
      ...CloneVisitor,
    }),
  );
}

/**
 * Returns a clone of `root` with `node` removed.
 *
 * @param root
 * @param node
 */
export function duplicate(root: RaisinNode, node: RaisinNode): RaisinNode {
  const cloneIfMatching = (n: RaisinNode) => (n === node ? [n, clone(n)] : [n]);
  const DuplicateVisitor: NodeVisitor<RaisinNode[]> = {
    onText: cloneIfMatching,
    onDirective: cloneIfMatching,
    onComment: cloneIfMatching,
    onStyle: cloneIfMatching,
    onElement: (n, dupeChildren) => {
      if (node === n) {
        return [n, clone(n)];
      }
      const children = flatDeep<RaisinNode>(dupeChildren);
      return [{ ...n, children }];
    },
    onCData: (n, dupeChildren) => {
      if (node === n) {
        return [clone(n), clone(n)];
      }
      const children = flatDeep<RaisinNode>(dupeChildren);
      return [{ ...n, children }];
    },
    onRoot: (n, dupeChildren) => {
      if (node === n) {
        return [clone(n), clone(n)];
      }
      const children = flatDeep<RaisinNode>(dupeChildren);
      return [{ ...n, children }];
    },
  };

  const nodes = visit(root, DuplicateVisitor);
  // Root node should not be duplicatable
  return freeze(nodes[0]);
}

/**
 * Replaces an element in place in the tree and all it's parents.
 *
 * @param callback - used to notify of any changes anywhere in the tree
 */
export function replace(root: RaisinNode, previous: RaisinNode, next: RaisinNode, callback?: ReplacementCallback): RaisinNode {
  function swap(n: RaisinNode): RaisinNode {
    if (n === previous) {
      callback && callback(n, next);
      return next;
    }
    return n;
  }

  function swapWithChildren(el: RaisinNodeWithChildren, children?: RaisinNode[]) {
    if (el === previous) {
      callback && callback(el, next);
      return next;
    }
    if (el.children !== children) {
      const replacement = {
        ...el,
        children,
      };
      callback && callback(el, replacement);
      return replacement;
    }
    return el;
  }

  return visit(root, {
    onText: swap,
    onComment: swap,
    onDirective: swap,
    onStyle: swap,
    onCData: swapWithChildren,
    onElement: swapWithChildren,
    onRoot: swapWithChildren,
  });
}

/**
 * Move a node to be a child of the parent at the given index.
 *
 * The node will be removed from it's other location in the tree if it exists.
 */
export function move(root: RaisinNode, node: RaisinNode, newParent: RaisinNode, newIdx: number): RaisinNode {
  const cloned = node;
  return freeze(
    visit(root, {
      skipNode(n) {
        return n === node;
      },
      ...IdentityVisitor,
      onElement(el, children) {
        const newChildren = el === newParent ? add(children, cloned, newIdx) : children;
        return { ...el, children: newChildren };
      },
      onRoot(el, children) {
        const newChildren = el === newParent ? add(children, cloned, newIdx) : children;
        return { ...el, children: newChildren };
      },
    }),
  );
}

/**
 * Inserts a new node as a child of the parent at the specified index.
 *
 * When adding new elements make sure they are cloned or fresh elements before inserting them here.
 *
 */
export function insertAt(root: RaisinNode, node: RaisinNode, newParent: RaisinNode, newIdx: number): RaisinNode {
  return freeze(
    visit(root, {
      ...IdentityVisitor,
      onElement(el, children) {
        const newChildren = el === newParent ? add(children, node, newIdx) : children;
        return { ...el, children: newChildren };
      },
      onRoot(el, children) {
        const newChildren = el === newParent ? add(children, node, newIdx) : children;
        return { ...el, children: newChildren };
      },
    }),
  );
}

function isBlankOrEmpty(str: string) {
  return !str || /^\s*$/.test(str) || str.length === 0 || !str.trim();
}

export function removeWhitespace(root: RaisinNode): RaisinNode {
  return visit(root, {
    ...CloneVisitor,
    onText(text) {
      if (isBlankOrEmpty(text.data.trim())) {
        return undefined;
      }
      return text;
    },
  });
}

function add<T>(arr: T[], el: T, idx: number): T[] {
  const before = arr.slice(0, idx);
  const after = arr.slice(idx, arr.length);
  return [...before, el, ...after];
}

function freeze(node: RaisinNode) {
  return visitAll(node, Object.freeze);
}

function visitAll(node: RaisinNode, fn: (n: RaisinNode) => RaisinNode): RaisinNode {
  return visit(node, {
    onCData: fn,
    onText: fn,
    onStyle: fn,
    onDirective: fn,
    onComment: fn,
    onElement: fn,
    onRoot: fn,
  });
}

export const IdentityVisitor: NodeVisitor<RaisinNode> = {
  onText: n => n,
  onDirective: n => n,
  onComment: n => n,
  onElement: n => n,
  onStyle: n => n,
  onCData: n => n,
  onRoot: n => n,
};

const CloneVisitor: NodeVisitor<RaisinNode> = {
  onText: n => ({ ...n }),
  onDirective: n => ({ ...n }),
  onComment: n => ({ ...n }),
  // TODO: deep clone CSS ast
  onStyle: n => ({...n}),
  onElement: (n, children) => ({ ...n, children: [...children] }),
  onCData: (n, children) => ({ ...n, children: [...children] }),
  onRoot: (n, children) => ({ ...n, children: [...children] }),
};

/**
 * Returns a deep copy of a RaisinNode
 */
export function clone(n: RaisinNode): RaisinNode {
  return cloneDeep(n);
}

/**
 * Deep flattening of arrays of arrays
 *
 * use recursion with reduce and concat
 */
function flatDeep<T>(arr: T[] | T[][], d = 1): T[] {
  // @ts-ignore
  return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), []) : arr.slice();
}

/**
 * Returns an array of parents, with the first element being the parent, and then their ancestors
 */
export function getAncestry(
  root: RaisinNode,
  node: RaisinNode,
  // Provide this for performance improvement
  parents = getParents(root),
): RaisinNodeWithChildren[] {
  const ancestry: RaisinNodeWithChildren[] = [];
  let current = node;
  while (true) {
    let parent = parents.get(current);
    if (parent === undefined) {
      break;
    }
    ancestry.push(parent);
    current = parent;
  }
  return [...ancestry];
}

type ReplacementCallback = (prev: RaisinNode, next: RaisinNode) => void;
