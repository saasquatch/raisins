import { isNodeWithChildren, NodePath, RaisinNode } from '@raisins/core';

/**
 * Resolves a {@link NodePath} against a document, returning `undefined` for a
 * dangling path instead of throwing like core's `getNode`. Use for any path
 * held across document updates (picked, dragged), which can go stale.
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
