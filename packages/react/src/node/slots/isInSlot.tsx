import { RaisinNode } from '@raisins/core';
import { isElementNode } from '../../util/isNode';

// TODO: Remove raisinnode to improve performance?
export function isInSlot(c: RaisinNode, slotName: string): boolean {
  const slotNameForNode = isElementNode(c) ? c.attribs.slot : undefined;
  if (!slotName && !slotNameForNode) {
    // Default slot (might not have a slot attributes)
    // Have to hanlde undefined.
    return true;
  }
  return slotName === slotNameForNode;
}
