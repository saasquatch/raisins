import { keymap } from 'prosemirror-keymap';
import { useMemo } from 'react';
import { useUpdateAtom } from 'jotai/utils';
import { UndoAtom, RedoAtom } from '../editting/HistoryAtoms';

export function useRaisinHistoryPlugin() {
  const undo = useUpdateAtom(UndoAtom);
  const redo = useUpdateAtom(RedoAtom);

  // TODO: This `useMemo` seems like it could be an atom
  return useMemo(() => {
    return keymap({
      'Mod-z': () => {
        undo();
        return true;
      },
      'Mod-y': () => {
        redo();
        return true;
      },
    });
  }, [undo, redo]);
}
