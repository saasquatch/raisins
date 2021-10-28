import { RaisinElementNode, StyleNodeProps } from '@raisins/core';
import { CssNodePlain } from 'css-tree';
import { useAtomValue } from 'jotai/utils';
import React from 'react';
import { useCoreEditingApi } from "../editting/CoreEditingAPI";
import { SelectedNodeAtom } from '../selection/SelectedAtom';
import { StyleNodeEditor } from '../stylesheets/StyleEditor';
import { isElementNode } from '../util/isNode';
import { AttributesEditor } from './AttributeEditor';

export function EditorPanel() {
  const props = useCoreEditingApi();
  const selected = useAtomValue(SelectedNodeAtom);

  if (isElementNode(selected)) {
    const element = selected;

    const styleProps: StyleNodeProps = {
      node: element.style as CssNodePlain,
      setNode: (nextStyle) => {
        const nextStyleVal: CssNodePlain =
          typeof nextStyle === 'function'
            ? nextStyle(element.style!)
            : nextStyle;
        props.replaceNode({
          prev: element,
          next: {
            ...element,
            style: nextStyleVal,
          } as RaisinElementNode,
        });
      },
    };

    return (
      <div>
        <AttributesEditor node={element} />
        {element.style && <StyleNodeEditor {...styleProps} />}
      </div>
    );
  }

  return <div>No tag selected</div>;
}
