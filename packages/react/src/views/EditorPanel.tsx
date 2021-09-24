import { RaisinElementNode, StyleNodeProps } from '@raisins/core';
import { CssNodePlain } from 'css-tree';
import { ElementType } from 'domelementtype';
import React from 'react';
import { Model } from '../model/EditorModel';
import { AttributesEditor } from './AttributeEditor';
import { StyleNodeEditor } from './StyleEditor';

export function EditorPanel(props: Model) {
  if (props.selected?.type === ElementType.Tag) {
    const element = props.selected as RaisinElementNode;

    const styleProps: StyleNodeProps = {
      node: element.style as CssNodePlain,
      setNode: nextStyle => {
        const nextStyleVal: CssNodePlain = typeof nextStyle === 'function' ? nextStyle(element.style!) : nextStyle;
        props.replaceNode(element, { ...element, style: nextStyleVal } as RaisinElementNode);
      },
    };

    return (
      <div>
        <AttributesEditor node={element} model={props} />
        {element.style && <StyleNodeEditor {...styleProps} />}
      </div>
    );
  }

  return <div>No tag selected</div>;
}
