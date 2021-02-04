import { h } from '@stencil/core';
import { ElementType } from 'domelementtype';
import { Model } from '../model/Dom';
import { RaisinElementNode } from '../model/RaisinNode';
import { AttributesEditor } from './AttributeEditor';

export function EditorPanel(props: Model) {
  if (props.selected?.type === ElementType.Tag) {
    const element = props.selected as RaisinElementNode;

    return <AttributesEditor node={element} model={props} />;
  }

  return <div>No tag selected</div>;
}