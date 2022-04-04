import { RaisinDocumentNode, RaisinElementNode } from '@raisins/core';
import { ElementType } from 'domelementtype';
import { atom, PrimitiveAtom, SetStateAction } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import React, { useMemo, useRef } from 'react';
import { SoulSaverAtom } from '../core/souls/SoulSaverAtom';
import { RaisinScope } from '../core/RaisinScope';
import { SelectedNodeAtom } from '../core/selection/SelectedNode';
import { GetSoulAtom } from '../core/souls/Soul';
import { NodeAtomProvider, useNodeAtom } from '../node/NodeContext';
import { isElementNode } from '../util/isNode';
import { createMemoizeAtom } from '../util/weakCache';
import { EditSelectedNodeAtom } from '../views/EditSelectedNodeAtom';
import {
  ProseTextSelection,
  useProseEditorOnAtom,
} from './prosemirror/ProseEditor';

export default function SelectedNodeRichTextEditor() {
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

const memoized = createMemoizeAtom();
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
      const soulSaver = get(SoulSaverAtom);
      set(nodeAtom, soulSaver(prevNode, nextNode) as RaisinElementNode);
    }
  );
  const selectionAtomAtom = atom<PrimitiveAtom<ProseTextSelection | undefined>>(
    (get) => {
      const node = get(nodeAtom);
      const getSoul = get(GetSoulAtom);
      const soul = getSoul(node);

      const selectionAtom = memoized(
        () => atom<ProseTextSelection | undefined>(undefined),
        [soul]
      );
      return selectionAtom;
    }
  );
  const selection = atom(
    (get) => get(get(selectionAtomAtom)),
    (get, set, next: SetStateAction<ProseTextSelection | undefined>) => {
      set(get(selectionAtomAtom), next);
    }
  );
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
