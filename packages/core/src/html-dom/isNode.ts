import {
  RaisinCommentNode,
  RaisinProcessingInstructionNode,
  RaisinStyleNode
} from "..";
import { COMMENT, DIRECTIVE, ROOT, STYLE, TAG, TEXT } from "./domElementType";
import {
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNode,
  RaisinNodeWithChildren,
  RaisinTextNode
} from "./RaisinNode";

export function isNodeWithChildren(
  node?: RaisinNode
): node is RaisinNodeWithChildren {
  return isElementNode(node) || isRoot(node);
}

export function isRoot(node?: RaisinNode): node is RaisinDocumentNode {
  return nodeIsType(ROOT, node);
}

export function isElementNode(node?: RaisinNode): node is RaisinElementNode {
  return nodeIsType(TAG, node);
}

export function isStyleNode(node?: RaisinNode): node is RaisinStyleNode {
  return nodeIsType(STYLE, node);
}

export function isTextNode(node?: RaisinNode): node is RaisinTextNode {
  return nodeIsType(TEXT, node);
}

export function isCommentNode(node?: RaisinNode): node is RaisinCommentNode {
  return nodeIsType(COMMENT, node);
}

export function isDirectiveNode(
  node?: RaisinNode
): node is RaisinProcessingInstructionNode {
  return nodeIsType(DIRECTIVE, node);
}

function nodeIsType(type: string, node?: RaisinNode) {
  if (!node) return false;
  if (node.type !== type) return false;
  return true;
}
