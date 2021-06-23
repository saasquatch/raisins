import { ElementType } from 'domelementtype';
import React from "react";
import { RaisinElementNode } from '../core/html-dom/RaisinNode';
import { Model } from '../model/EditorModel';
import { AttributesEditor } from './AttributeEditor';

export function EditorPanel(props: Model) {
  if (props.selected?.type === ElementType.Tag) {
    const element = props.selected as RaisinElementNode;

    return <AttributesEditor node={element} model={props} />;
  }

  return <div>No tag selected</div>;
}
