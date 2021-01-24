import { DefaultSlot, NodeWithSlots } from '../../model/Dom';
import { visit } from '../../util';
import { RaisinNode } from '../../model/RaisinNode';

export function getSlots(node: RaisinNode) {
  const noSlots = (node: RaisinNode) => ({
    node,
  });
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
      if (el.tagName == 'has-slots') {
        const nodeWithSlots = {
          node: el,
          slots: [
            {
              key: 'slot-1',
              name: 'Slot 1 (slot-1)',
              // @ts-ignore -- add better type checking for node types
              children: children.filter(c => c.node?.attribs?.slot === 'slot-1'),
            },
            {
              key: 'slot-2',
              name: 'Slot 2 (slot-2)',
              // @ts-ignore -- add better type checking for node types
              children: children.filter(c => c.node?.attribs?.slot === 'slot-2'),
            },
          ],
        };
        return nodeWithSlots;
      }
      return {
        node: el,
        slots: [{ ...DefaultSlot, children }],
      };
    },
  });
}
