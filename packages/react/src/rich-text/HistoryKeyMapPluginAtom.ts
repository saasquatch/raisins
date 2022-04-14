import { molecule } from 'jotai-molecules';
import { keymap } from 'prosemirror-keymap';
import { Plugin } from 'prosemirror-state';
import { EditSelectedMolecule } from '../core/editting/EditSelectedAtom';
import { HistoryMolecule } from '../core/editting/HistoryAtoms';
import connectedAtom from '../util/atoms/connectedAtom';

export const HistoryKeyMapPluginMolecule = molecule((getMol) => {
  const { RedoAtom, UndoAtom } = getMol(HistoryMolecule);
  const { ClearSelectionAtom } = getMol(EditSelectedMolecule);
  const HistoryKeyMapPluginAtom = connectedAtom((_, set) => {
    // FIXME: on undo/redo, we also need to update the selection to move the cursor

    const plugin: Plugin = keymap({
      //  Uppercase Z implies "Shift" is used
      'Mod-Z': () => {
        set(RedoAtom);
        return true;
      },
      'Mod-z': () => {
        set(UndoAtom);
        return true;
      },
      'Mod-y': () => {
        set(RedoAtom);
        return true;
      },
      Escape: () => {
        set(ClearSelectionAtom);
        return true;
      },
    });
    return plugin;
  });

  return {
    HistoryKeyMapPluginAtom,
  };
});
