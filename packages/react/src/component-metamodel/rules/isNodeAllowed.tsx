import { RaisinElementNode, RaisinNode } from '@raisins/core';
import { CustomElement } from '../Component';
import { doesChildAllowParent } from './doesChildAllowParent';
import { doesParentAllowChild } from './doesParentAllowChild';

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
  const parentAllowsChild = doesParentAllowChild(child, parentMeta, slot);
  const childAllowsParents = doesChildAllowParent(childMeta, parent);
  return parentAllowsChild && childAllowsParents;
}
