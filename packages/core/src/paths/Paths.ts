import { isNodeWithChilden } from "../html-dom/isNode";
import { RaisinNode } from "../html-dom/RaisinNode";

export type NodePath = number[];

export type NodeSelection = {
  type: "node";
  path: NodePath;
};

export function getPath(
  root: RaisinNode,
  node: RaisinNode
): NodePath | undefined {
  if (root === node) {
    // Empty array means this node
    return [];
  }
  if (isNodeWithChilden(root)) {
    return root.children
      .map((c, idx) => {
        const childPath = getPath(c, node);
        if (childPath !== undefined) {
          return [idx, ...childPath];
        }
        return undefined;
      })
      .find(c => c !== undefined);
  }
  return undefined;
}

export function getNode(root: RaisinNode, path: NodePath): RaisinNode {
  return path.reduce((node: RaisinNode, path) => {
    if (isNodeWithChilden(node)) {
      return node.children[path];
    }
    throw new Error("Node type" + node.type + "doesn't have children");
  }, root);
}
