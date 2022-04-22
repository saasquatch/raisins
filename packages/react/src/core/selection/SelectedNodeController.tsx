import { useAtomValue } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import React from 'react';
import { SelectedNodeMolecule } from '..';
import { NodeScopeProvider } from '../../node';
import { EditSelectedMolecule } from '../editting/EditSelectedAtom';

export type SelectedNodeControllerProps = {
  HasSelectionComponent: React.ComponentType;
  NoSelectionComponent?: React.ComponentType;
};

export const SelectedNodeController = ({
  HasSelectionComponent,
  NoSelectionComponent = () => <></>,
}: SelectedNodeControllerProps) => {
  const { HasSelectionAtom } = useMolecule(SelectedNodeMolecule);

  const { EditSelectedNodeAtom } = useMolecule(EditSelectedMolecule);

  const hasSelection = useAtomValue(HasSelectionAtom);

  if (!hasSelection) return <NoSelectionComponent />;
  return (
    <NodeScopeProvider nodeAtom={EditSelectedNodeAtom}>
      <HasSelectionComponent />
    </NodeScopeProvider>
  );
};
