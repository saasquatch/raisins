import { CustomElement } from "@raisins/schema/schema";
import { isElementNode, isRoot } from "../../html-dom/isNode";
import { RaisinNode } from "../../html-dom/RaisinNode";

/**
 * Given a child and it's parent's metadata
 * Checks if the parent will allow the child to be embedded
 *
 * @returns
 */
export function doesParentAllowChild(
  child: RaisinNode,
  parentMeta: CustomElement,
  slot: string | undefined = "",
  parent: RaisinNode
): boolean {
  // Root element is always allowed.
  // This allows editing for fragments, since Root !== body
  if (isRoot(parent)) return true;
  const slots = parentMeta.slots;
  const slotMeta = slots?.find(s => s.name === slot);

  if (!slotMeta && !slots?.length) return false;

  // TODO: Add custom pseudo selector, e.g. `:inline` for text-only slots https://github.com/fb55/css-select/blob/493cca99cd075d7bf64451bbd518325f11da084e/test/qwery.ts#L18
  if (!isElementNode(child)) return false;

  const { validChildren = ["*"] } = slotMeta ?? {};
  const { tagName } = child;

  // TODO: Replace this with CSS selector implementation from core
  const parentAllowsChild =
    validChildren?.includes("*") ||
    (tagName && validChildren?.includes(tagName)) ||
    false;

  return parentAllowsChild;
}
