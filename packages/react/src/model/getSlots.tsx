import { htmlUtil, RaisinElementNode, RaisinNode } from '@raisins/core';
import { Slot } from '@raisins/schema/schema';
import { ComponentMetaProvider } from '../component-metamodel/ComponentModel';
import { DefaultSlot, NodeWithSlots } from './EditorModel';

const { visit } = htmlUtil;

export function getSlots(
  node: RaisinNode,
  getComponentMeta: ComponentMetaProvider
): NodeWithSlots | undefined {
  const noSlots = (_: RaisinNode): undefined => undefined;
  const noSlotsWChildren = (
    node: RaisinNode,
    children: NodeWithSlots[]
  ): NodeWithSlots => ({
    node,
    slots: [
      {
        ...DefaultSlot,
        children,
      },
    ],
  });
  
  return visit<NodeWithSlots>(node, {
    onCData: noSlotsWChildren,
    onComment: noSlots,
    onText: noSlots,
    onDirective: noSlots,
    onRoot: noSlotsWChildren,
    onElement(el, children) {
      const meta = getComponentMeta(el);

      type Reduced = { [key: string]: NodeWithSlots[] };

      const definedSlots: Reduced =
        meta.slots?.reduce((acc, s) => {
          return {
            ...acc,
            [s.name]: [],
          };
        }, {} as Reduced) ?? {};
      const allSlots = children.reduce((acc, child) => {
        const slotName = (child.node as RaisinElementNode)?.attribs?.slot ?? '';
        const previous = acc[slotName] ?? [];

        return {
          ...acc,
          [slotName]: [...previous, child],
        };
      }, definedSlots);

      const allSlotsWithMeta = Object.keys(allSlots).sort().map((k) => {
        const slot: Slot = meta.slots?.find((s) => s.name === k) ?? { name: k };
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
