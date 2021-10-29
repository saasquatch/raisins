import { RaisinElementNode, RaisinNode, StyleNodeProps } from '@raisins/core';
import { CssNodePlain } from 'css-tree';
import { atom, SetStateAction } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import React from 'react';
import { NodeAtomProvider } from '../node/node-context';
import { useCoreEditingApi } from '../editting/useCoreEditingAPI';
import { ReplaceNodeAtom } from '../editting/EditAtoms';
import { SelectedNodeAtom } from '../selection/SelectedAtom';
import { StyleNodeEditor } from '../stylesheets/StyleEditor';
import { isFunction } from '../util/isFunction';
import { isElementNode } from '../util/isNode';
import { AttributesEditor } from './AttributeEditor';
import { RaisinScope } from '../atoms/RaisinScope';

const EditSelectedNodeAtom = atom(
  (get) => get(SelectedNodeAtom)!,
  (get, set, next: SetStateAction<RaisinNode>) => {
    const selected = get(SelectedNodeAtom);
    if (!selected) return; // Don't allow editing if nothing selected
    const nextValue = isFunction(next) ? next(selected) : next;
    set(ReplaceNodeAtom, {
      prev: selected,
      next: nextValue,
    });
  }
);

export function EditorPanel() {
  const props = useCoreEditingApi();
  const selected = useAtomValue(SelectedNodeAtom, RaisinScope);
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
        <NodeAtomProvider nodeAtom={EditSelectedNodeAtom}>
          <AttributesEditor />
        </NodeAtomProvider>
        {element.style && <StyleNodeEditor {...styleProps} />}
      </div>
    );
  }

  return <div>No tag selected</div>;
}
