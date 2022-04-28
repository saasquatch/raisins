import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { toggleMark } from 'prosemirror-commands';
import type { MarkType } from 'prosemirror-model';
import { ProseEditorStateMolecule } from './ProseEditorStateMolecule';

type ToggleMarkAction = {
  mark: MarkType;
  e: React.MouseEvent;
  attrs?: { [key: string]: any };
};

export const ProseToggleMarkMolecule = molecule((getMol) => {
  const stateAtom = getMol(ProseEditorStateMolecule);

  const toggleMarkAtom = atom(
    null,
    (get, set, { mark, e, attrs }: ToggleMarkAction) => {
      // Prevent default avoid loss of focus
      e.preventDefault();
      const state = get(stateAtom);
      toggleMark(mark, attrs)(state, (tr) => set(stateAtom, tr));
    }
  );

  return {
    toggleMarkAtom,
  };
});
