import { DefaultSlot, Model, NodeWithSlots } from './EditorModel';
import { visit } from '../html-dom/util';
import { RaisinNode } from '../html-dom/RaisinNode';

export function getSlots(node: RaisinNode, getComponentMeta: Model['getComponentMeta']) {
  const noSlots = (_: RaisinNode) => undefined;
  const noSlotsWChildren = (node: RaisinNode, children: NodeWithSlots[]) => ({
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
          if (slot.key === '') {
          }
          // @ts-ignore -- add better type checking for node types
          const myChildren = children.filter(x => x).filter(c => c.node?.attribs?.slot === slot.key || (slot.key === '' && c.node?.attribs?.slot === undefined));

          // TODO: Filter slots so they don't show text nodes
          return {
            key: slot.key,
            name: slot.title,
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
  });
}
