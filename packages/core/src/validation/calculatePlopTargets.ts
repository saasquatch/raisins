import { CustomElement } from "@raisins/schema/schema";
import { isElementNode } from "../html-dom/isNode";
import { RaisinNode } from "../html-dom/RaisinNode";
import { isNodeAllowed } from "./rules/isNodeAllowed";

export type PlopTarget = {
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
  if (!isElementNode(parent)) return [];
  const raisinChildren = parent.children;
  const plopSlot = schema.possiblePlopMeta.slots?.map(e => e.name) ?? [];
  const seenSlots = new Set();
  const remainingSlots = new Set(plopSlot);
  const removeIDs: number[] = [];

  if (parent.children.length <= 0) {
    // Slot plop targets when there are no children
    return (
      schema.parentMeta.slots
        ?.filter(value => plopSlot.includes(value.name))
        .map(s => {
          return {
            slot: s.name,
            idx: 0,
            parent
          };
        }) ?? []
    );
  }

  var lastIdx = 0;
  const newChildren =
    raisinChildren?.reduce((acc, raisinChild, idx) => {
      if (
        // No plop around text nodes
        !isElementNode(raisinChild)
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
      else remainingSlots.delete(slot);

      const plopTargets = [];

      if (!seenSlots.has(slot)) {
        plopTargets.push({
          idx,
          slot,
          parent
        });
      }
      plopTargets.push({
        idx: idx + 1,
        slot,
        parent
      });
      seenSlots.add(slot);
      lastIdx = idx + 1;

      if (
        // No plops around picked node (that's redundant)
        raisinChild === possiblePlop
      ) {
        // No plop targets around element nodes
        removeIDs.push(idx, idx + 1);
      }

      return [...acc, ...plopTargets];
    }, [] as PlopTarget[]) ?? [];

  remainingSlots.forEach(slot => {
    newChildren.push({
      idx: lastIdx,
      slot
    });
  });

  return newChildren
    .filter(function(x) {
      return !removeIDs.includes(x.idx);
    })
    .filter(
      (v, i, a) =>
        a.findIndex(t => JSON.stringify(t) === JSON.stringify(v)) === i
    );
}
