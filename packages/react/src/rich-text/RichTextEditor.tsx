import { RaisinDocumentNode, RaisinElementNode } from '@raisins/core';
import { ElementType } from 'domelementtype';
import { atom, PrimitiveAtom, SetStateAction } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import React, { useMemo, useRef } from 'react';
import { RaisinScope } from '../atoms/RaisinScope';
import { NodeAtomProvider, useNodeAtom } from '../node/node-context';
import {
  ProseTextSelection,
  useProseEditorOnAtom,
} from '../prosemirror/ProseEditor';
import { SelectedNodeAtom } from '../selection/SelectedAtom';
import { isElementNode } from '../util/isNode';
import { EditSelectedNodeAtom } from '../views/EditSelectedNodeAtom';

export default function RichTextEditor() {
  const isElementAtom = useRef(
    atom((get) => isElementNode(get(SelectedNodeAtom)))
  ).current;
  const isElement = useAtomValue(isElementAtom, RaisinScope);
  if (!isElement) return <div>Not an element</div>;

  return (
    <NodeAtomProvider nodeAtom={EditSelectedNodeAtom}>
      <RichTextEditorForAtom />
    </NodeAtomProvider>
  );
}

export function useRichTextEditorForAtom() {
  const nodeAtom = (useNodeAtom() as unknown) as PrimitiveAtom<RaisinElementNode>;
  const { docNodeAtom, selection } = useMemo(() => createAtoms(nodeAtom), [
    nodeAtom,
  ]);

  const { mountRef } = useProseEditorOnAtom(docNodeAtom, selection);
  return { mountRef };
}

function createAtoms(nodeAtom: PrimitiveAtom<RaisinElementNode>) {
  const docNodeAtom = atom<
    RaisinDocumentNode,
    SetStateAction<RaisinDocumentNode>
  >(
    (get) => {
      return {
        type: ElementType.Root,
        children: get(nodeAtom).children,
      };
    },
    (get, set, next) => {
      const prevNode = get(nodeAtom);
      const prevDocNode = {
        type: ElementType.Root,
        children: prevNode.children,
      } as RaisinDocumentNode;
      const nextVal = typeof next === 'function' ? next(prevDocNode) : next;
      const nextNode = {
        ...prevNode,
        children: nextVal.children,
      };
      set(nodeAtom, nextNode);
    }
  );
  const selection = atom<ProseTextSelection | undefined>(undefined);
  return {
    selection,
    docNodeAtom,
  };
}

/**
 * A controller for editing rich text via a Prose Editor
 *
 * @returns
 */
export function RichTextEditorForAtom() {
  const { mountRef } = useRichTextEditorForAtom();
  return <div ref={mountRef} />;
}
