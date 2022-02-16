import hotkeys, { KeyHandler } from 'hotkeys-js';
import { atom, useAtomValue, WritableAtom } from 'jotai';
import connectedAtom from '../atoms/connectedAtom';
import { RaisinScope } from '../atoms/RaisinScope';
import { DeleteSelectedAtom } from '../editting/EditSelectedAtom';
import { RedoAtom, UndoAtom } from '../editting/HistoryAtoms';
import { SelectedAtom } from '../selection/SelectedAtom';

const HotKeysAtom = connectedAtom(
  (_, set) => {
    const fn: KeyHandler = function (event: Event, handler) {
      switch (handler.key) {
        case 'ctrl+z':
          event.preventDefault();
          set(UndoAtom);
          break;
        case 'ctrl+shift+z':
        case 'ctrl+y':
          event.preventDefault();
          set(RedoAtom);
          break;
        // case 'd':
        // case 'backspace':
        case 'delete':
          event.preventDefault();
          set(DeleteSelectedAtom);
          break;
        case 'esc':
          event.preventDefault();
          set(SelectedAtom, undefined);
          break;
        default:
      }
    };

    const keys = 'ctrl+y,ctrl+shift+z,ctrl+z,delete,backspace,d,esc';

    // Binds hot keys
    hotkeys(keys, fn);

    return { keys, fn };
  },
  (state) => {
    state && hotkeys.unbind(state.keys, state.fn);
  }
);

export function useHotkeys() {
  useAtomValue(HotKeysAtom, RaisinScope);
}
