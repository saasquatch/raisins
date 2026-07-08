import { isNodeWithChildren, NodePath, RaisinNode } from '@raisins/core';

/**
 * Resolves a {@link NodePath} against a document, returning `undefined` when
 * the path no longer resolves — unlike core's `getNode`, which throws.
 *
 * A path is only valid for the exact document it was computed against. Any
 * atom that HOLDS a path across document updates (picked, dragged) must
 * resolve it with this: the document can change while the path is held
 * (drop commits, undo/redo, external edits), leaving the path pointing at a
 * text node or out of bounds.
 */
export function tryGetNode(
  root: RaisinNode,
  path: NodePath
): RaisinNode | undefined {
  let node: RaisinNode | undefined = root;
  for (const idx of path) {
    if (!isNodeWithChildren(node)) return undefined;
    node = node.children[idx];
    if (node === undefined) return undefined;
  }
  return node;
}
