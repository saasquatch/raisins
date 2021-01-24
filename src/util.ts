import { ElementType } from 'domelementtype';

import { RaisinCommentNode, RaisinDocumentNode, RaisinElementNode, RaisinNode, RaisinNodeWithChildren, RaisinProcessingInstructionNode, RaisinTextNode } from './model/RaisinNode';

export function getParent(root: RaisinNode, child: RaisinNode): RaisinNodeWithChildren {
  switch (root.type) {
    case ElementType.Text:
      return undefined;
    case ElementType.Directive:
      return undefined;
    case ElementType.Comment:
      return undefined;
    case ElementType.Tag:
    case ElementType.Script:
    case ElementType.Style:
    case ElementType.Root:
    case ElementType.CDATA: {
      const element = root as RaisinNodeWithChildren;
      const idx = element.children.indexOf(child);
      if (idx) {
        return element;
      }
      const descendant = element.children.find(c => getParent(c, child));
      return descendant as RaisinNodeWithChildren;
    }
    case ElementType.Doctype: {
      // This type isn't used yet.
      throw new Error('Not implemented yet: ElementType.Doctype case');
    }
  }
}

export function visit<T>(node: RaisinNode, visitor: NodeVisitor<T>, recursive: boolean = true): T {
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
    case ElementType.Script:
    case ElementType.Style: {
      if (!visitor.onElement) break;
      const element = node as RaisinElementNode;
      const children = recursive ? element.children.map(c => visit(c, visitor, recursive)).filter(c => c !== undefined) : [];
      result = visitor.onElement(element, children);
      break;
    }
    case ElementType.CDATA: {
      if (!visitor.onCData) break;
      const cdata = node as RaisinNodeWithChildren;
      const children = recursive ? cdata.children.map(c => visit(c, visitor, recursive)).filter(c => c !== undefined) : [];
      result = visitor.onCData(cdata, children);
      break;
    }
    case ElementType.Root: {
      if (!visitor.onRoot) break;
      const root = node as RaisinDocumentNode;
      const children = recursive ? root.children.map(c => visit(c, visitor, recursive)).filter(c => c !== undefined) : [];
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
  onText?(text: RaisinTextNode): T | undefined;
  onElement?(element: RaisinElementNode, children?: T[]): T | undefined;
  onRoot?(node: RaisinDocumentNode, children?: T[]): T | undefined;

  onDirective?(directive: RaisinProcessingInstructionNode): T | undefined;
  onComment?(comment: RaisinCommentNode): T | undefined;
  onCData?(element: RaisinNodeWithChildren, children?: T[]): T | undefined;
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

export function replace(root: RaisinNode, previous: RaisinNode, next: RaisinNode): RaisinNode {
  function swap(n: RaisinNode): RaisinNode {
    if (n === previous) {
      return next;
    }
    return n;
  }

  return visit(root, {
    onText: swap,
    onComment: swap,
    onDirective: swap,
    onCData(el, children) {
      if (el === previous) return next;
      if (el.children !== children) {
        return {
          ...el,
          children,
        };
      }
      return el;
    },
    onElement(el, children) {
      if (el === previous) return next;
      if (el.children !== children) {
        return {
          ...el,
          children,
        };
      }
      return el;
    },
    onRoot(el, children) {
      if (el === previous) return next;
      if (el.children !== children) {
        return {
          ...el,
          children,
        };
      }
      return el;
    },
  });
}

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
    onDirective: fn,
    onComment: fn,
    onElement: fn,
    onRoot: fn,
  });
}

const IdentityVisitor: NodeVisitor<RaisinNode> = {
  onText: n => n,
  onDirective: n => n,
  onComment: n => n,
  onElement: n => n,
  onCData: n => n,
  onRoot: n => n,
};

const CloneVisitor: NodeVisitor<RaisinNode> = {
  onText: n => ({ ...n }),
  onDirective: n => ({ ...n }),
  onComment: n => ({ ...n }),
  onElement: (n, children) => ({ ...n, children }),
  onCData: (n, children) => ({ ...n, children }),
  onRoot: (n, children) => ({ ...n, children }),
};

function clone(n: RaisinNode): RaisinNode {
  return visit(n, CloneVisitor);
}

// to enable deep level flatten use recursion with reduce and concat
function flatDeep<T>(arr: any, d = 1): T[] {
  // @ts-ignore
  return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), []) : arr.slice();
}

/**
 * Returns an array of parents, with the first element being the parent, and then their ancestors
 */
export function getAncestry(root: RaisinNode, node: RaisinNode): RaisinNodeWithChildren[] {
  function addToAncestry(n: RaisinNodeWithChildren, children: RaisinNodeWithChildren[]) {
    if (n.children.indexOf(node)) {
      // First parent
      return [n];
    }
    if (children && children.some(x => x)) {
      // Grand parent
      return [...children.filter(x => x), n];
    }
    // Not in ancestry
    return undefined;
  }
  return visit(root, {
    onText: () => undefined,
    onDirective: () => undefined,
    onComment: () => undefined,

    onCData: addToAncestry,
    onElement: addToAncestry,
    onRoot: addToAncestry,
  });
}
