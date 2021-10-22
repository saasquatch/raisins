import hotkeys from 'hotkeys-js';
import { useUpdateAtom } from 'jotai/utils';
import { useEffect } from 'react';
import { DeleteSelectedAtom } from './useCore';
import { RedoAtom, UndoAtom } from "./HistoryAtoms";

export function useHotkeys() {

  const undo = useUpdateAtom(UndoAtom);
  const redo = useUpdateAtom(RedoAtom);
  const deleteSelected = useUpdateAtom(DeleteSelectedAtom);

  useEffect(() => {
    // TODO: Scope so that backspace and delete only work depending on what is "focused"
    // TODO: Cleanup listeners on onmount so that the shortcuts don't live forever (e.g. and mess up program engine installation)
    const fn = function (event: Event, handler: any) {
      switch (handler.key) {
        case 'ctrl+z':
          event.preventDefault();
          undo();
          break;
        case 'ctrl+shift+z':
        case 'ctrl+y':
          event.preventDefault();
          redo();
          break;
        // case 'd':
        // case 'backspace':
        case 'delete':
          event.preventDefault();
          deleteSelected();
          break;
        default:
      }
    };

    const keys = 'ctrl+y,ctrl+shift+z,ctrl+z,delete,backspace,d';
    hotkeys(keys, fn);
    return () => hotkeys.unbind(keys, fn);
  }, [undo, redo, deleteSelected]);
}
