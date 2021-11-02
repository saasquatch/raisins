import { RaisinStyleNode } from "..";
import { ROOT, STYLE, TAG, TEXT } from "./domElementType";
import {
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNode,
  RaisinNodeWithChildren,
  RaisinTextNode
} from "./RaisinNode";

export function isNodeWithChilden(
  node?: RaisinNode
): node is RaisinNodeWithChildren {
  return isElementNode(node) || isRoot(node);
}

export function isRoot(node?: RaisinNode): node is RaisinDocumentNode {
  if (!node) return false;
  if (node.type !== ROOT) return false;
  return true;
}

export function isElementNode(node?: RaisinNode): node is RaisinElementNode {
  if (!node) return false;
  if (node.type !== TAG) return false;
  return true;
}

export function isStyleNode(node?: RaisinNode): node is RaisinStyleNode {
  if (!node) return false;
  if (node.type !== STYLE) return false;
  return true;
}

export function isTextNode(node?: RaisinNode): node is RaisinTextNode {
  if (!node) return false;
  if (node.type !== TEXT) return false;
  return true;
}
