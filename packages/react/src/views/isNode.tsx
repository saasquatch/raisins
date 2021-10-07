import { ElementType } from 'domelementtype';
import {
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNode,
  RaisinTextNode,
} from '@raisins/core';

export function isRoot(node?: RaisinNode): node is RaisinDocumentNode {
  if (!node) return false;
  if (node.type.toString() !== ElementType.Root.toString()) return false;
  return true;
}

export function isElementNode(node?: RaisinNode): node is RaisinElementNode {
  if (!node) return false;
  if (node.type !== ElementType.Tag) return false;
  return true;
}

export function isTextNode(node?: RaisinNode): node is RaisinTextNode {
  if (!node) return false;
  if (node.type !== ElementType.Text) return false;
  return true;
}
