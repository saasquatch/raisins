import { atom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import React from 'react';
import { RaisinScope } from '../core/RaisinScope';
import { NodeAtomProvider } from '../node/node-context';
import { SelectedNodeAtom } from '../core/selection/SelectedNode';
import { isElementNode } from '../util/isNode';
import { AttributesEditor } from './AttributeEditor';
import { EditSelectedNodeAtom } from './EditSelectedNodeAtom';

const SelectedIsElement = atom((get) => isElementNode(get(SelectedNodeAtom)));

export function SelectedElementEditorController() {
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
