import { CustomElement } from "@raisins/schema/schema";
import _ from "lodash";
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
  // deal with root
  // if (!isElementNode(parent)) return [];

  // if (schema.parentMeta.slots === undefined) return [];

  // const slots = schema.parentMeta.slots.map(slot => slot.name);
  // const slotList = slots.reduce((obj, value) => ({ ...obj, [value]: [] }), {});

  // parent.children.forEach(child => {
  //   if (!isElementNode(child)) return;

  //   if (Object.hasOwn(slotList, child.attribs.slot)) {
  //     //@ts-ignore
  //     slotList[child.attribs.slot].push(child);
  //   }
  // });

  // const targets: PlopTarget[] = [];

  // let idx = 0;
  // slots.forEach(slot => {
  //   //@ts-ignore
  //   if (slotList[slot].length === 0)
  //     targets.push({
  //       slot: slot,
  //       idx: idx,
  //       parent
  //     });
  //   //@ts-ignore
  //   slotList[slot].forEach(element => {
  //     if (element) {
  //       targets.push({
  //         slot: slot,
  //         idx: idx,
  //         parent
  //       });

  //       targets.push({
  //         slot: slot,
  //         idx: idx + 1,
  //         parent
  //       });

  //       idx = idx + 1;
  //     } else {
  //       targets.push({
  //         slot: slot,
  //         idx: idx,
  //         parent
  //       });
  //     }
  //   });
  // });

  // //@ts-ignore
  // const plopSlots = schema.possiblePlopMeta.slots.map(slot => slot.name) ?? [];

  // return targets
  //   .filter(
  //     (v, i, a) =>
  //       a.findIndex(t => JSON.stringify(t) === JSON.stringify(v)) === i
  //   )
  //   .filter(n => plopSlots.includes(n.slot));

  // TODO: Root node should allow any children
  if (!isElementNode(parent)) return [];
  const raisinChildren = parent.children;
  const plopSlot = schema.possiblePlopMeta.slots?.map(e => e.name) ?? [];
  const seenSlots = new Set();
  const remainingSlots = new Set(plopSlot);

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

      if (!plopSlot.includes(slot)) return acc;
      else remainingSlots.delete(slot);

      const plopTargets = [];

      if (!seenSlots.has(slot)) {
        plopTargets.push({
          idx,
          slot,
          parent
        });
      }

      seenSlots.add(slot);

      plopTargets.push({
        idx: idx + 1,
        slot,
        parent
      });

      lastIdx = idx + 1;

      return [...acc, ...plopTargets];
    }, [] as PlopTarget[]) ?? [];

  remainingSlots.forEach(slot => {
    newChildren.push({
      idx: lastIdx,
      slot,
      parent
    });
  });

  return newChildren.filter(
    (v, i, a) => a.findIndex(t => JSON.stringify(t) === JSON.stringify(v)) === i
  );
}
