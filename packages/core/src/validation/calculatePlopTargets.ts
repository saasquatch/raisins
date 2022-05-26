import { CustomElement } from "@raisins/schema/schema";
import { isElementNode } from "../html-dom/isNode";
import { RaisinNode, RaisinTextNode } from "../html-dom/RaisinNode";
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
  },
  parents: WeakMap<RaisinNode, RaisinNode>
): PlopTarget[] {
  if (!isElementNode(parent)) return [];

  // Can't drop directly into oneself
  if (parent === possiblePlop) return [];
  let ancestor: RaisinNode | undefined = parent;
  do {
    // If an ancestor is the plop target, don't allow it.
    if (ancestor === possiblePlop) return [];
    ancestor = parents.get(ancestor);
  } while (ancestor !== undefined);

  const raisinChildren = parent.children
    .map((child, idx) => ({ child, idx }))
    .filter(
      ({ child }) =>
        !(child as RaisinTextNode).data ||
        (child as RaisinTextNode).data?.trim()?.replace(/\\n/g, "")
    );
  const seenSlots = new Set();
  const remainingSlots = new Set(
    schema.parentMeta.slots?.map(e => e.name) ?? []
  );

  if (parent.children.length <= 0) {
    const plops: PlopTarget[] = [];
    // Slot plop targets when there are no children
    schema.parentMeta.slots?.forEach(s => {
      const isValid = isNodeAllowed(
        possiblePlop,
        schema.possiblePlopMeta,
        parent,
        schema.parentMeta,
        s.name
      );
      if (!isValid) return;
      plops.push({
        slot: s.name,
        idx: 0
      });
    });
    return plops;
  }

  const removeIDs: any = {};

  let lastIdx = 0;
  const newChildren =
    raisinChildren?.reduce((acc, { child, idx: childIdx }, idx) => {
      if (
        // No plop around text nodes
        !isElementNode(child)
      ) {
        // No plop targets around element nodes
        return acc;
      }

      const slot = child.attribs.slot ?? "";
      const isValid = isNodeAllowed(
        possiblePlop,
        schema.possiblePlopMeta,
        parent,
        schema.parentMeta,
        slot
      );

      if (!isValid) return acc;

      remainingSlots.delete(slot);

      let plopTargets = [];

      const removeIdx =
        idx + 1 === raisinChildren.length - 1 &&
        possiblePlop !== raisinChildren[raisinChildren.length - 1]?.child;

      if (!seenSlots.has(slot)) {
        plopTargets.push({
          idx: childIdx,
          slot
        });
      } else if (
        child === possiblePlop ||
        raisinChildren[idx + 1]?.child === possiblePlop ||
        raisinChildren[raisinChildren.length - 1]?.child === possiblePlop
      ) {
        plopTargets.push({
          idx: childIdx,
          slot
        });
      } else {
        plopTargets.push({
          idx: childIdx + 1,
          slot
        });
      }

      seenSlots.add(slot);

      lastIdx = idx + 1;
      if (
        // No plops around picked node (that's redundant)
        child === possiblePlop
      ) {
        // No plop targets around element nodes
        if (removeIDs.slot === undefined) removeIDs[slot] = [];
        removeIDs[slot].push(childIdx);
        if (removeIdx) removeIDs[slot].push(childIdx + 1);
      }

      return [...acc, ...plopTargets];
    }, [] as PlopTarget[]) ?? [];

  remainingSlots.forEach(slot => {
    const isValid = isNodeAllowed(
      possiblePlop,
      schema.possiblePlopMeta,
      parent,
      schema.parentMeta,
      slot
    );
    if (isValid)
      newChildren.push({
        idx: lastIdx,
        slot
      });
  });

  console.log(raisinChildren);

  return newChildren
    .filter(x => {
      if (removeIDs[x.slot] && removeIDs[x.slot].includes(x.idx)) return false;
      return true;
    })
    .filter(
      (v, i, a) =>
        a.findIndex(t => JSON.stringify(t) === JSON.stringify(v)) === i
    );
}
