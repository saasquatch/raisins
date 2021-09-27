import { DefaultSlot, Model, NodeWithSlots } from './EditorModel';
import { RaisinNode, htmlUtil } from '@raisins/core';

const { visit } = htmlUtil

export function getSlots(node: RaisinNode, getComponentMeta: Model['getComponentMeta']):NodeWithSlots|undefined {
  const noSlots = (_: RaisinNode):undefined => undefined;
  const noSlotsWChildren = (node: RaisinNode, children: NodeWithSlots[]):NodeWithSlots => ({
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
        const slots = meta.slots.map(slot => {
          if (slot.name === '') {
          }
          // @ts-ignore -- add better type checking for node types
          const myChildren = children.filter(x => x).filter(c => c.node?.attribs?.slot === slot.name || (slot.name === '' && c.node?.attribs?.slot === undefined));

          // TODO: Filter slots so they don't show text nodes
          return {
            key: slot.name,
            name: slot.summary ?? slot.name,
            children: myChildren,
          };
        });
        const nodeWithSlots = {
          node: el,
          slots,
        };

        return nodeWithSlots;
      }

      // if (el.tagName == 'has-slots') {
      //   const nodeWithSlots = {
      //     node: el,
      //     slots: [
      //       {
      //         key: 'slot-1',
      //         name: 'Slot 1 (slot-1)',
      //         // @ts-ignore -- add better type checking for node types
      //         children: children.filter(c => c.node?.attribs?.slot === 'slot-1'),
      //       },
      //       {
      //         key: 'slot-2',
      //         name: 'Slot 2 (slot-2)',
      //         // @ts-ignore -- add better type checking for node types
      //         children: children.filter(c => c.node?.attribs?.slot === 'slot-2'),
      //       },
      //     ],
      //   };
      //   return nodeWithSlots;
      // }

      // TODO: Figure out how to deal with elements that shouldn't have childen but they do?
      //    -  maybe show the children, but don't allow drop targets or "Add New"
      return {
        node: el,
        slots: [{ ...DefaultSlot, children }],
      };
    },
  })!;
}
