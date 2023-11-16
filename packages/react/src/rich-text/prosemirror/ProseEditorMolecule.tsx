import { molecule } from 'bunshi/react';
import { ProseEditorStateMolecule } from './ProseEditorStateMolecule';
import { ProseEditorViewMolecule } from './ProseEditorViewMolecule';

export const ProseEditorMolecule = molecule((getMol) => {
  return {
    state: getMol(ProseEditorStateMolecule),
    view: getMol(ProseEditorViewMolecule),
  };
});
