import { keymap } from 'prosemirror-keymap';
import { useMemo } from 'react';
import { useUpdateAtom } from 'jotai/utils';
import { UndoAtom, RedoAtom } from '../editting/HistoryAtoms';
import { RaisinScope } from '../atoms/RaisinScope';

export function useRaisinHistoryPlugin() {
  const undo = useUpdateAtom(UndoAtom, RaisinScope);
  const redo = useUpdateAtom(RedoAtom, RaisinScope);

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
