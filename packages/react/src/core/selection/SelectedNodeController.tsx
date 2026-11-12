import { useMolecule } from "bunshi/react";
import { useAtomValue } from "jotai";
import React from "react";
import { NodeScopeProvider } from "../../node/index.ts";
import { EditSelectedMolecule } from "../editting/EditSelectedAtom.ts";
import { SelectedNodeMolecule } from "../index.ts";

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
