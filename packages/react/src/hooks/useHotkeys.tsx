import { useEffect } from 'react';
import hotkeys from 'hotkeys-js';
import { CoreModel, HistoryModel } from '../model/EditorModel';

export function useHotkeys(core: CoreModel & HistoryModel) {
  const { undo, redo, deleteSelected } = core;
  useEffect(() => {
    // TODO: Scope so that backspace and delete only work depending on what is "focused"
    // TODO: Cleanup listeners on onmount so that the shortcuts don't live forever (e.g. and mess up program engine installation)
    const fn = function (event: Event, handler: any) {
      switch (handler.key) {
        case 'ctrl+z':
          event.preventDefault();
          undo();
          break;
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

    const keys = 'ctrl+y,ctrl+z,delete,backspace,d';
    hotkeys(keys, fn);
    return () => hotkeys.unbind(keys, fn);
  }, [undo, redo, deleteSelected]);
}
