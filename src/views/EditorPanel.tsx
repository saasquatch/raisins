import { h } from '@stencil/core';
import { ElementType } from 'domelementtype';
import { Element } from 'domhandler';
import { Model } from '../model/Dom';
import { AttributesEditor } from './AttributeEditor';

export function EditorPanel(props: Model) {
  if (props.selected?.type === ElementType.Tag) {
    const element = props.selected as Element;

    return <AttributesEditor node={element} model={props} />;
  }

  return <div>No tag selected</div>;
}
