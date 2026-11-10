import type { CustomElement, Slot } from "@raisins/schema/schema.js";
import type { RaisinNode } from "../html-dom/RaisinNode.ts";
import { visit } from "../html-dom/util.ts";
import { DefaultSlot, type NodeWithSlots } from "./SlotModel.ts";

export type ComponentMetaProvider = (tagName: string) => CustomElement;

export function getSlots(
  node: RaisinNode,
  getComponentMeta: ComponentMetaProvider,
): NodeWithSlots | undefined {
  const noSlots = (): undefined => undefined;
  const noSlotsWChildren = (
    slotNode: RaisinNode,
    children: NodeWithSlots[],
  ): NodeWithSlots => ({
    node: slotNode,
    slots: [
      {
        ...DefaultSlot,
        children,
      },
    ],
  });

  return visit<NodeWithSlots>(node, {
    onComment: noSlots,
    onText: noSlots,
    onDirective: noSlots,
    onRoot: noSlotsWChildren,
    onElement(el, children) {
      const meta = getComponentMeta(el.tagName);

      type Reduced = { [key: string]: NodeWithSlots[] };

      const definedSlots: Reduced =
        meta.slots?.reduce((acc, s) => {
          return {
            ...acc,
            [s.name]: [],
          };
        }, {} as Reduced) ?? {};
      const allSlots = children.reduce((acc, child) => {
        const slotName =
          ("attribs" in child.node
            ? child.node.attribs?.["slot"]
            : undefined) ?? "";
        const previous = acc[slotName] ?? [];

        return {
          ...acc,
          [slotName]: [...previous, child],
        };
      }, definedSlots);

      const allSlotsWithMeta = Object.keys(allSlots)
        .sort()
        .map((k) => {
          const slot: Slot = meta.slots?.find((s) => s.name === k) ?? {
            name: k,
          };
          return {
            slot,
            children: allSlots[k],
          };
        });
      // TODO: Filter slots so they don't show text nodes?
      // TODO: Figure out how to deal with elements that shouldn't have childen but they do?
      //    -  maybe show the children, but don't allow drop targets or "Add New"
      //    - show RED validation?
      return {
        node: el,
        slots: allSlotsWithMeta,
      };
    },
  })!;
}
