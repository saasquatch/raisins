import { useMolecule } from 'jotai-molecules';
import { useAtomValue } from 'jotai/utils';
import React from 'react';
import { NodeScopeProvider } from '../node/NodeScope';
import {
  NodeRichTextController,
  SelectedNodeRichTextEditorMolecule,
} from './RichTextEditor';

export function SelectedNodeRichTextEditor() {
  const atoms = useMolecule(SelectedNodeRichTextEditorMolecule);
  const isElement = useAtomValue(atoms.IsSelectedAnElement);
  if (!isElement) return <div>Not an element</div>;

  return (
    <NodeScopeProvider nodeAtom={atoms.EditSelectedNodeAtom}>
      <NodeRichTextController />
    </NodeScopeProvider>
  );
}
