import hotkeys, { KeyHandler } from 'hotkeys-js';
import { useUpdateAtom } from 'jotai/utils';
import { useEffect } from 'react';
import { RaisinScope } from '../atoms/RaisinScope';
import { DeleteSelectedAtom } from "../editting/EditSelectedAtom";
import { RedoAtom, UndoAtom } from '../editting/HistoryAtoms';

export function useHotkeys() {
  const undo = useUpdateAtom(UndoAtom, RaisinScope);
  const redo = useUpdateAtom(RedoAtom, RaisinScope);
  const deleteSelected = useUpdateAtom(DeleteSelectedAtom, RaisinScope);

  useEffect(() => {
    // TODO: Scope so that backspace and delete only work depending on what is "focused"
    // TODO: Cleanup listeners on onmount so that the shortcuts don't live forever (e.g. and mess up program engine installation)
    const fn:KeyHandler = function (event: Event, handler) {
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
