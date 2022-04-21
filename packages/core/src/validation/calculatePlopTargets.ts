import { CustomElement } from "@raisins/schema/schema";
import { isElementNode } from "../html-dom/isNode";
import { RaisinNode } from "../html-dom/RaisinNode";
import { isNodeAllowed } from "./rules/isNodeAllowed";

export type PlopTarget = {
  parent: RaisinNode;
  idx: number;
  slot: string;
};
export function calculatePlopTargets(
  parent: RaisinNode,
  possiblePlop: RaisinNode,
  schema: {
    parentMeta: CustomElement;
    possiblePlopMeta: CustomElement;
  }
): PlopTarget[] {
  // TODO: Root node should allow any children
  if (!isElementNode(parent)) return [];
  const raisinChildren = parent.children;

  if (parent.children.length <= 0) {
    // Slot plop targets when there are no children
    return (
      schema.parentMeta.slots?.map((s, idx) => {
        return {
          slot: s.name,
          idx,
          parent
        };
      }) ?? []
    );
  }
  const newChildren =
    raisinChildren?.reduce((acc, raisinChild, idx) => {
      if (
        // No plop around text nodes
        !isElementNode(raisinChild) ||
        // No plops around picked node (that's redundant)
        raisinChild === possiblePlop
      ) {
	// No plop targets around element nodes
        return acc;
      }
      const slot = raisinChild.attribs.slot ?? "";
      const isValid = isNodeAllowed(
        possiblePlop,
        schema.possiblePlopMeta,
        parent,
        schema.parentMeta,
        slot
      );
      if (!isValid) return acc;

      const plopBefore = {
        idx,
        slot,
        parent
      };
      return [...acc, plopBefore];
    }, [] as PlopTarget[]) ?? [];

  return newChildren;
  return [];
}
