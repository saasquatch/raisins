import { RaisinNode } from '@raisins/core';
import { CustomElement } from '../Component';
import { isElementNode } from '../../util/isNode';

/**
 * Given a child and it's parent's metadata
 * Checks if the parent will allow the child to be embedded
 * 
 * @returns 
 */
export function doesParentAllowChild(
  child: RaisinNode,
  parentMeta: CustomElement,
  slot: string | undefined
): boolean {
  const slots = parentMeta?.slots;
  const slotMeta = slots?.find((s) => s.name === slot);
  if (!slotMeta) return false;

  if (!isElementNode(child)) return false;

  const { tagName } = child;

  // TODO: Replace this with CSS selector implementation from core
  // TODO: Add custom pseudo selector, e.g. `:inline` for text-only slots https://github.com/fb55/css-select/blob/493cca99cd075d7bf64451bbd518325f11da084e/test/qwery.ts#L18
  const parentAllowsChild =
    slotMeta.validChildren?.includes('*') ||
    (tagName && slotMeta.validChildren?.includes(tagName)) ||
    false;
  return parentAllowsChild;
}
