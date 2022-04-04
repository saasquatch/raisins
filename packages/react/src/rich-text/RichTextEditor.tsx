import { RaisinDocumentNode, RaisinElementNode } from '@raisins/core';
import { ElementType } from 'domelementtype';
import { atom, PrimitiveAtom, SetStateAction } from 'jotai';
import { molecule, useMolecule } from 'jotai-molecules';
import { useAtomValue } from 'jotai/utils';
import React from 'react';
import { EditSelectedMolecule } from '../core/editting/EditSelectedAtom';
import { RaisinScope } from '../core/RaisinScope';
import { SelectedMolecule } from '../core/selection/SelectedNode';
import { SoulsMolecule } from '../core/souls/Soul';
import { NodeAtomMolecule, NodeAtomProvider } from '../node/NodeScope';
import { isElementNode } from '../util/isNode';
import { createMemoizeAtom } from '../util/weakCache';
import {
  ProseTextSelection,
  useProseEditorOnAtom,
} from './prosemirror/ProseEditor';

const SelectedNodeRichTextEditorMolecule = molecule((getMol) => {
  const { SelectedNodeAtom } = getMol(SelectedMolecule);
  const { EditSelectedNodeAtom } = getMol(EditSelectedMolecule);
  const IsSelectedAnElement = atom((get) =>
    isElementNode(get(SelectedNodeAtom))
  );

  return {
    IsSelectedAnElement,
    EditSelectedNodeAtom,
  };
});

export default function SelectedNodeRichTextEditor() {
  const atoms = useMolecule(SelectedNodeRichTextEditorMolecule);
  const isElement = useAtomValue(atoms.IsSelectedAnElement, RaisinScope);
  if (!isElement) return <div>Not an element</div>;

  return (
    <NodeAtomProvider nodeAtom={atoms.EditSelectedNodeAtom}>
      <RichTextEditorForAtom />
    </NodeAtomProvider>
  );
}

export function useRichTextEditorForAtom() {
  const { docNodeAtom, selection } = useMolecule(RichTextMolecule);

  const { mountRef } = useProseEditorOnAtom(docNodeAtom, selection);
  return { mountRef };
}

const memoized = createMemoizeAtom();

const RichTextMolecule = molecule((getMol) => {
  const nodeAtom = getMol(NodeAtomMolecule) as PrimitiveAtom<RaisinElementNode>;

  const { GetSoulAtom, SoulSaverAtom } = getMol(SoulsMolecule);

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
});

/**
 * A controller for editing rich text via a Prose Editor
 *
 * @returns
 */
export function RichTextEditorForAtom() {
  const { mountRef } = useRichTextEditorForAtom();
  return <div ref={mountRef} />;
}
