import { RaisinTextNode } from '@raisins/core';
import { ElementType } from 'domelementtype';
import { Block } from '../../src/component-metamodel/ComponentModel';

export const DEFAULT_BLOCKS: Block[] = [
  {
    title: 'Some Div',
    content: {
      type: ElementType.Tag,
      tagName: 'div',
      attribs: {},
      children: [
        { type: ElementType.Text, data: 'I am a div' } as RaisinTextNode,
      ],
    },
  },
];
