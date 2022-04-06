import hotkeys, { KeyHandler } from 'hotkeys-js';
import { useAtomValue } from 'jotai';
import { molecule, useMolecule } from 'jotai-molecules';
import connectedAtom from '../util/atoms/connectedAtom';
import { EditSelectedMolecule } from './editting/EditSelectedAtom';
import { HistoryMolecule } from './editting/HistoryAtoms';

export const HotkeysMolecule = molecule((getMol) => {
  const { RedoAtom, UndoAtom } = getMol(HistoryMolecule);
  const { DeleteSelectedAtom, ClearSelectionAtom } = getMol(
    EditSelectedMolecule
  );

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
            set(ClearSelectionAtom);
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
  return { HotKeysAtom };
});

export function useHotkeys() {
  const { HotKeysAtom } = useMolecule(HotkeysMolecule);
  useAtomValue(HotKeysAtom);
}
