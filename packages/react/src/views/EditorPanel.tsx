import { RaisinNode } from '@raisins/core';
import { atom, SetStateAction } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import React from 'react';
import { RaisinScope } from '../atoms/RaisinScope';
import { ReplaceNodeAtom } from '../editting/EditAtoms';
import { NodeAtomProvider } from '../node/node-context';
import { SelectedNodeAtom } from '../selection/SelectedAtom';
import { isFunction } from '../util/isFunction';
import { isElementNode } from '../util/isNode';
import { AttributesEditor } from './AttributeEditor';

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

const SelectedIsElement = atom((get) => isElementNode(get(SelectedNodeAtom)));

export function EditorPanel() {
  const isElement = useAtomValue(SelectedIsElement, RaisinScope);
  if (isElement) {
    return (
      <div>
        <NodeAtomProvider nodeAtom={EditSelectedNodeAtom}>
          <AttributesEditor />
        </NodeAtomProvider>
      </div>
    );
  }

  return <div>No tag selected</div>;
}

// const props = useCoreEditingApi();
// const styleProps: StyleNodeProps = {
//   node: element.style as CssNodePlain,
//   setNode: (nextStyle) => {
//     const nextStyleVal: CssNodePlain =
//       typeof nextStyle === 'function'
//         ? nextStyle(element.style!)
//         : nextStyle;
//     props.replaceNode({
//       prev: element,
//       next: {
//         ...element,
//         style: nextStyleVal,
//       } as RaisinElementNode,
//     });
//   },
// };
