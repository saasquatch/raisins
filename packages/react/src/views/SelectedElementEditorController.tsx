import { atom } from 'jotai';
import { molecule, useMolecule } from 'jotai-molecules';
import { useAtomValue } from 'jotai/utils';
import React from 'react';
import { EditSelectedMolecule } from '../core/editting/EditSelectedAtom';
import { RaisinScope } from '../core/RaisinScope';
import { SelectedMolecule } from '../core/selection/SelectedNode';
import { NodeAtomProvider } from '../node/NodeScope';
import { isElementNode } from '../util/isNode';
import { AttributesEditor } from './AttributeEditor';

const mol = molecule((getMol) => {
  const { SelectedNodeAtom } = getMol(SelectedMolecule);
  const { EditSelectedNodeAtom } = getMol(EditSelectedMolecule);
  const SelectedIsElement = atom((get) => isElementNode(get(SelectedNodeAtom)));

  return { SelectedIsElement, EditSelectedNodeAtom };
});

export function SelectedElementEditorController() {
  const { SelectedIsElement, EditSelectedNodeAtom } = useMolecule(mol);
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
