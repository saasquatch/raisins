import cloneDeep from "lodash.clonedeep";
import { getNode, NodePath } from "../paths/Paths";
import { COMMENT, DIRECTIVE, ROOT, STYLE, TAG, TEXT } from "./domElementType";
import { isElementNode } from "./isNode";
import {
  RaisinCommentNode,
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNode,
  RaisinNodeWithChildren,
  RaisinProcessingInstructionNode,
  RaisinStyleNode,
  RaisinTextNode
} from "./RaisinNode";

/**
 * Provides a WeakMap for parent lookups
 *
 * @param root
 */
export function getParents(
  root: RaisinNode
): WeakMap<RaisinNode, RaisinNodeWithChildren> {
  const map = new WeakMap<RaisinNode, RaisinNodeWithChildren>();
  function storeParent(elem: RaisinNodeWithChildren, children?: RaisinNode[]) {
    children?.forEach(c => map.set(c, elem));
    return elem;
  }

  visit(root, {
    onElement: storeParent,
    onRoot: storeParent,
    onStyle: n => n,
    onComment: n => n,
    onDirective: n => n,
    onText: n => n
  });
  return map;
}

type OnReplace = (prev: RaisinNode, next: RaisinNode) => RaisinNode;
const DefaultOnReplace: OnReplace = (_, next) => next;

export function visit<T = unknown>(
  node: RaisinNode,
  visitor: Partial<NodeVisitor<T>>,
  recursive: boolean = true
): T | undefined {
  let result: T | undefined;
  const skip = visitor.skipNode && visitor.skipNode(node);
  if (skip) {
    return;
  }

  switch (node.type) {
    case TEXT:
      result = visitor.onText && visitor.onText(node);
      break;
    case DIRECTIVE: {
      result = visitor.onDirective && visitor.onDirective(node);
      break;
    }
    case COMMENT:
      result = visitor.onComment && visitor.onComment(node);
      break;
    case TAG: {
      if (!visitor.onElement) break;
      const children =
        recursive && node.children
          ? (node.children
              .map(c => visit(c, visitor, recursive))
              .filter(c => c !== undefined) as T[])
          : [];
      result = visitor.onElement(node, children);
      break;
    }
    case STYLE: {
      if (!visitor.onStyle) break;
      result = visitor.onStyle(node);
      break;
    }
    case ROOT: {
      if (!visitor.onRoot) break;
      const root = node as RaisinDocumentNode;
      const children =
        recursive && root.children
          ? (root.children
              .map(c => visit(c, visitor, recursive))
              .filter(c => c !== undefined) as T[])
          : [];
      result = visitor.onRoot(root, children);
      break;
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
  onElement(element: RaisinElementNode, children: T[]): T | undefined;
  onRoot(node: RaisinDocumentNode, children: T[]): T | undefined;

  onDirective(directive: RaisinProcessingInstructionNode): T | undefined;
  onComment(comment: RaisinCommentNode): T | undefined;
}

/**
 * Returns a clone of `root` with `node` removed.
 *
 * @param root
 * @param node
 */
export function remove(
  root: RaisinNode,
  node: RaisinNode,
  onReplace = DefaultOnReplace
): RaisinNode {
  if (root === node) {
    throw new Error("Can't remove node from itself");
  }
  const removed = visit(root, {
    skipNode(n) {
      return n === node;
    },
    ...CloneVisitor(onReplace)
  });
  return freeze(
    // Would only be null if node removed itself
    removed!
  );
}
export function removePath(
  root: RaisinNode,
  path: NodePath,
  onReplace = DefaultOnReplace
): RaisinNode {
  return remove(root, getNode(root, path), onReplace);
}

/**
 * Returns a clone of `root` with `node` removed.
 *
 * @param root
 * @param node
 */
export function duplicate(
  root: RaisinNode,
  node: RaisinNode,
  onReplace = DefaultOnReplace
): RaisinNode {
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
      return [onReplace(n, { ...n, children })];
    },
    onRoot: (n, dupeChildren) => {
      if (node === n) {
        throw new Error("Cannot duplicate root RaisinNode.");
      }
      const children = flatDeep<RaisinNode>(dupeChildren);
      return [onReplace(n, { ...n, children })];
    }
  };

  const nodes = visit(root, DuplicateVisitor)!;
  if (nodes.length > 1) throw new Error("Cannot duplicate root RaisinNode.");
  // Root node should not be duplicatable
  return freeze(nodes![0]);
}

/**
 * Replaces an element in place in the tree and all it's parents.
 *
 * @param callback - used to notify of any changes anywhere in the tree
 */
export function replace(
  root: RaisinNode,
  previous: RaisinNode,
  next: RaisinNode,
  onReplace = DefaultOnReplace
): RaisinNode {
  function swap(n: RaisinNode): RaisinNode {
    if (n === previous) {
      return onReplace(previous, next);
    }
    return n;
  }

  function swapWithChildren(
    el: RaisinNodeWithChildren,
    children?: RaisinNode[]
  ) {
    if (el === previous) {
      return onReplace(el, next);
    }
    if (el.children !== children) {
      const replacement: RaisinNode = {
        ...el,
        children: children ?? []
      };
      return onReplace(el, replacement);
    }
    return el;
  }

  return visit(root, {
    onText: swap,
    onComment: swap,
    onDirective: swap,
    onStyle: swap,
    onElement: swapWithChildren,
    onRoot: swapWithChildren
  })!;
}

export function replacePath(
  root: RaisinNode,
  previous: NodePath,
  next: RaisinNode,
  onReplace = DefaultOnReplace
): RaisinNode {
  return replace(root, getNode(root, previous), next, onReplace);
}

/**
 * Move a node to be a child of the parent at the given index.
 *
 * The node will be removed from it's other location in the tree if it exists.
 */
export function move(
  root: RaisinNode,
  node: RaisinNode,
  newParent: RaisinNode,
  newIdx: number,
  onReplace = DefaultOnReplace
): RaisinNode {
  if (root === node) throw new Error("Can't root node");
  if (node === newParent) throw new Error("Can't move node inside itself");

  const cloned = node;

  const moved = visit(root, {
    skipNode(n) {
      return n === node;
    },
    ...IdentityVisitor,
    onElement(el, children) {
      const newChildren =
        el === newParent ? addItem(children, cloned, newIdx) : children;
      return onReplace(el, { ...el, children: newChildren });
    },
    onRoot(el, children) {
      const newChildren =
        el === newParent ? addItem(children, cloned, newIdx) : children;
      return onReplace(el, { ...el, children: newChildren });
    }
  });
  return freeze(moved!);
}

export function moveToPath(
  root: RaisinNode,
  node: NodePath,
  newParent: NodePath,
  newIdx: number,
  onReplace = DefaultOnReplace
): RaisinNode {
  return move(
    root,
    getNode(root, node),
    getNode(root, newParent),
    newIdx,
    onReplace
  );
}

export function moveNode(
  root: RaisinNode,
  nodeToMove: RaisinNode,
  slot: string,
  parentPath: NodePath,
  idx: number
): RaisinNode {
  const nodeWithNewSlot = !isElementNode(nodeToMove)
    ? { ...nodeToMove }
    : nodeToMove.attribs.slot === undefined
    ? {
        ...nodeToMove,
        attribs: { ...nodeToMove.attribs }
      }
    : {
        ...nodeToMove,
        attribs: { ...nodeToMove.attribs, slot }
      };
  const parent = getNode(root, parentPath);

  const onChildren = (
    el: RaisinNodeWithChildren,
    newChildren: RaisinNode[]
  ) => {
    const found = newChildren.indexOf(nodeToMove);

    if (el === parent && found >= 0) {
      const isMovingFromSlot = isMovingNodeFromSlot(
        nodeToMove as RaisinElementNode,
        nodeWithNewSlot as RaisinElementNode
      );
      // Case 0 -- moved within the same level of the tree
      return {
        ...el,
        children: addItemAndRemove(
          newChildren,
          nodeWithNewSlot,
          idx,
          nodeToMove,
          isMovingFromSlot
        )
      };
    } else if (el === parent) {
      // Case 1 -- Just added to this level of tree, but not removed as well
      return {
        ...el,
        children: addItem(newChildren, nodeWithNewSlot, idx)
      };
    } else if (found >= 0) {
      // Case 2 -- Removed from this level of the tree, to be inserted elsewhere
      return {
        ...el,
        children: removeItem(newChildren, found)
      } as RaisinNodeWithChildren;
    } else if (shallowEqual(newChildren, el.children)) {
      // Don't modify
      return el;
    } else {
      // Case 3 -- this part of the tree unaffected
      return {
        ...el,
        children: newChildren
      };
    }
  };
  const newDocument = visit<RaisinNode>(root, {
    onComment: c => c,
    onDirective: d => d,
    onElement: onChildren,
    onRoot: onChildren,
    onStyle: s => s,
    onText: t => t
  });
  return newDocument!;
}

/**
 * Inserts a new node as a child of the parent at the specified index.
 *
 * When adding new elements make sure they are cloned or fresh elements before inserting them here.
 *
 */
export function insertAt(
  root: RaisinNode,
  node: RaisinNode,
  newParent: RaisinNode,
  newIdx: number,
  onReplace = DefaultOnReplace
): RaisinNode {
  if (root === node) throw new Error("Can't root node");
  if (node === newParent) throw new Error("Can't move node inside itself");
  const replaceChildren = (
    el: RaisinNodeWithChildren,
    children: RaisinNode[]
  ): RaisinNode => {
    const newChildren =
      el === newParent ? addItem(children, node, newIdx) : children;
    return onReplace(el, { ...el, children: newChildren });
  };
  const moved = visit(root, {
    ...IdentityVisitor,
    onElement: replaceChildren,
    onRoot: replaceChildren
  });
  return freeze(moved!);
}
export function insertAtPath(
  root: RaisinNode,
  node: RaisinNode,
  newParent: NodePath,
  newIdx: number,
  onReplace = DefaultOnReplace
): RaisinNode {
  return insertAt(root, node, getNode(root, newParent), newIdx, onReplace);
}

function isBlankOrEmpty(str: string) {
  return !str || /^\s*$/.test(str) || str.length === 0 || !str.trim();
}

export function removeWhitespace(
  root: RaisinNode,
  onReplace = DefaultOnReplace
): RaisinNode {
  const cleaned = visit(root, {
    ...CloneVisitor(onReplace),
    onText(text) {
      text.data = text.data.trim();
      if (isBlankOrEmpty(text.data)) {
        return undefined;
      }
      return text;
    }
  });
  if (!cleaned)
    throw new Error(
      "Whitespace removal produced no content at all. Try this on a root node instead of an embedded text node"
    );
  return cleaned;
}

function freeze(node: RaisinNode) {
  return visitAll(node, Object.freeze);
}

export function visitAll(
  node: RaisinNode,
  fn: (n: RaisinNode) => RaisinNode
): RaisinNode {
  return visit(node, {
    onText: fn,
    onStyle: fn,
    onDirective: fn,
    onComment: fn,
    onElement: fn,
    onRoot: fn
  })!;
}

export const IdentityVisitor: NodeVisitor<RaisinNode> = {
  onText: n => n,
  onDirective: n => n,
  onComment: n => n,
  onElement: n => n,
  onStyle: n => n,
  onRoot: n => n
};

function CloneVisitor(onReplace = DefaultOnReplace): NodeVisitor<RaisinNode> {
  return {
    onText: n => onReplace(n, { ...n }),
    onDirective: n => onReplace(n, { ...n }),
    onComment: n => onReplace(n, { ...n }),
    // TODO: deep clone CSS ast
    onStyle: n => onReplace(n, { ...n }),
    onElement: (n, children) =>
      onReplace(n, {
        ...n,
        children: children ? [...children] : []
      }),
    onRoot: (n, children) =>
      onReplace(n, { ...n, children: children ? [...children] : [] })
  };
}

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
  return d > 0
    ? // @ts-ignore
      arr.reduce(
        // @ts-ignore
        (acc, val) =>
          acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val),
        []
      )
    : arr.slice();
}

/**
 * Returns an array of parents, with the first element being the parent, and then their ancestors
 */
export function getAncestry(
  root: RaisinNode,
  node: RaisinNode,
  // Provide this for performance improvement
  parents = getParents(root)
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

function addItemAndRemove<T>(
  arr: T[],
  elToAdd: T,
  idxToAdd: number,
  remove: T,
  isMovingFromSlot: boolean
): T[] {
  return arr.reduce((newArr, el, idx) => {
    // Move to new slot at same index or at the end of array
    if (
      el === remove &&
      isMovingFromSlot &&
      (idx === idxToAdd || (idx === idxToAdd - 1 && idxToAdd === arr.length))
    ) {
      return [...newArr, elToAdd];
    }

    if (el === remove) {
      // No remove item in new array
      return newArr;
    }
    if (idx === idxToAdd) {
      // Add in front of this index
      return [...newArr, elToAdd, el];
    }
    if (idx === idxToAdd - 1 && idxToAdd === arr.length) {
      // Add to the end of the array
      return [...newArr, el, elToAdd];
    }
    return [...newArr, el];
  }, [] as T[]);
}

function isMovingNodeFromSlot(
  nodeToMove: RaisinElementNode,
  nodeWithNewSlot: RaisinElementNode
) {
  return (
    nodeToMove.attribs.slot !== undefined &&
    isElementNode(nodeToMove) &&
    isElementNode(nodeWithNewSlot) &&
    nodeToMove?.attribs?.slot !== nodeWithNewSlot?.attribs?.slot
  );
}

function addItem<T>(arr: T[], el: T, idx: number): T[] {
  const before = arr.slice(0, idx);
  const after = arr.slice(idx, arr.length);
  return [...before, el, ...after];
}

function removeItem<T>(items: T[], index: number): T[] {
  const firstArr = items.slice(0, index);
  const secondArr = items.slice(index + 1);
  return [...firstArr, ...secondArr];
}

const shallowEqual = <T>(array1: T[], array2: T[]) =>
  array1.length === array2.length &&
  array1.every((value, index) => value === array2[index]);
