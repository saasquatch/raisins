import type { CustomElement } from "@raisins/schema";
import type { RaisinNode } from "../../html-dom/RaisinNode.ts";
import { doesChildAllowParent } from "./doesChildAllowParent.ts";
import { doesParentAllowChild } from "./doesParentAllowChild.ts";

/**
 * Given two nodes and their metadata
 * Checks both sides of relationship:
 *  - parent allows child
 *  - child allows parent
 *
 */
export function isNodeAllowed(
  child: RaisinNode,
  childMeta: CustomElement,
  parent: RaisinNode,
  parentMeta: CustomElement,
  slot: string
) {
  const parentAllowsChild = doesParentAllowChild(
    child,
    parentMeta,
    slot,
    parent
  );
  const childAllowsParents = doesChildAllowParent(childMeta, parent);
  return parentAllowsChild && childAllowsParents;
}
