import { molecule } from 'bunshi/react';
import { ProseEditorStateMolecule } from './ProseEditorStateMolecule.tsx';
import { ProseEditorViewMolecule } from './ProseEditorViewMolecule.tsx';

export const ProseEditorMolecule = molecule((getMol) => {
  return {
    state: getMol(ProseEditorStateMolecule),
    view: getMol(ProseEditorViewMolecule),
  };
});
