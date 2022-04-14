import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { toggleMark } from 'prosemirror-commands';
import type { MarkType } from 'prosemirror-model';
import { ProseEditorStateMolecule } from './ProseEditorStateMolecule';

export const ProseToggleMarkMolecule = molecule((getMol) => {
  const stateAtom = getMol(ProseEditorStateMolecule);

  const toggleMarkAtom = atom(
    null,
    (get, set, { mark, e }: { mark: MarkType; e: React.MouseEvent }) => {
      // Prevent default avoid loss of focus
      e.preventDefault();
      const state = get(stateAtom);
      toggleMark(mark)(state, (tr) => set(stateAtom, tr));
    }
  );

  const isBold = atom(get=>{

    const selection = get(stateAtom).selection;
    
  })

  return {
    toggleMarkAtom,
  };
});
