import { keymap } from 'prosemirror-keymap';
import connectedAtom from '../atoms/connectedAtom';
import { RedoAtom, UndoAtom } from '../editting/HistoryAtoms';

export const HistoryKeyMapPluginAtom = connectedAtom((_, set) => {
  const plugin = keymap({
    'Mod-z': () => {
      set(UndoAtom);
      return true;
    },
    'Mod-y': () => {
      set(RedoAtom);
      return true;
    },
  });
  return plugin;
});
