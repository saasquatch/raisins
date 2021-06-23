import { ElementType } from 'domelementtype';
import React from "react";
import { Model, RaisinElementNode } from '@raisins/core';
import { AttributesEditor } from './AttributeEditor';

export function EditorPanel(props: Model) {
  if (props.selected?.type === ElementType.Tag) {
    const element = props.selected as RaisinElementNode;

    return <AttributesEditor node={element} model={props} />;
  }

  return <div>No tag selected</div>;
}
