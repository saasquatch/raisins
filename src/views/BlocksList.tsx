import { h } from '@stencil/core';
import { ElementType } from 'domelementtype';
import { Model } from '../model/Dom';
import { RaisinElementNode, RaisinTextNode } from '../model/RaisinNode';

export default function BlocksList(props: Model) {
  const blocks: RaisinElementNode[] = [
    {
      type: ElementType.Tag,
      tagName: 'div',
      nodeType: 1,
      attribs: {},
      children: [{ type: ElementType.Text, data: 'I am a div' } as RaisinTextNode],
    },
    {
      type: ElementType.Tag,
      tagName: 'span',
      nodeType: 1,
      attribs: {},
      children: [{ type: ElementType.Text, data: 'I am a div' } as RaisinTextNode],
    },
  ];

  return (
    <div>
      <h1>Blocks</h1>
      {blocks.map(block => {
        // TODO: Make draggable onto the canvas or onto into layers
        const meta = props.getComponentMeta(block);
        return <div>{meta.title}</div>;
      })}
    </div>
  );
}
