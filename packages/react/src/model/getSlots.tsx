import { DefaultSlot, Model, NodeWithSlots } from './EditorModel';
import { RaisinNode, htmlUtil } from '@raisins/core';

const { visit } = htmlUtil;

export function getSlots(
  node: RaisinNode,
  getComponentMeta: Model['getComponentMeta']
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
      if (meta.slots?.length) {
        const slots = meta.slots.map((slot) => {
          if (slot.name === '') {
          }
          const myChildren = children
            .filter((x) => x)
            .filter(
              (c) =>
                // @ts-ignore -- add better type checking for node types
                c.node?.attribs?.slot === slot.name ||
                // @ts-ignore -- add better type checking for node types
                (slot.name === '' && c.node?.attribs?.slot === undefined)
            );

          // TODO: Filter slots so they don't show text nodes
          return {
            slot: slot,
            children: myChildren,
          };
        });
        const nodeWithSlots = {
          node: el,
          slots,
        };

        return nodeWithSlots;
      }

      // TODO: Figure out how to deal with elements that shouldn't have childen but they do?
      //    -  maybe show the children, but don't allow drop targets or "Add New"
      //    - show RED validation?
      return {
        node: el,
        slots: [{ ...DefaultSlot, children }],
      };
    },
  })!;
}
