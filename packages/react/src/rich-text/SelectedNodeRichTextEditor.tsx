import { useMolecule } from 'jotai-molecules';
import { useAtomValue } from 'jotai/utils';
import React from 'react';
import { SelectedNodeMolecule } from '../core';
import { EditSelectedMolecule } from '../core/editting/EditSelectedAtom';
import { NodeScopeProvider } from '../node/NodeScope';
import { NodeRichTextController } from './RichTextEditor';

export function SelectedNodeRichTextEditor() {
  const atoms = useMolecule(SelectedNodeMolecule);
  const editAtoms = useMolecule(EditSelectedMolecule);
  const isElement = useAtomValue(atoms.SelectedIsElement);
  if (!isElement) return <div>Not an element</div>;

  return (
    <NodeScopeProvider nodeAtom={editAtoms.EditSelectedNodeAtom}>
      <NodeRichTextController />
    </NodeScopeProvider>
  );
}
