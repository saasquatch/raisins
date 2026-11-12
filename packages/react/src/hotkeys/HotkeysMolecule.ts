import { molecule } from "bunshi/react";
import type { KeyHandler } from "hotkeys-js";
import hotkeys from "hotkeys-js";
import { EditSelectedMolecule } from "../core/editting/EditSelectedAtom.ts";
import { HistoryMolecule } from "../core/editting/HistoryAtoms.tsx";
import { PickAndPlopMolecule } from "../core/index.ts";
import connectedAtom from "../util/atoms/connectedAtom.tsx";

export const HotkeysMolecule = molecule((getMol) => {
  const { RedoAtom, UndoAtom } = getMol(HistoryMolecule);
  const { DeleteSelectedAtom, ClearSelectionAtom } =
    getMol(EditSelectedMolecule);
  const { PickedNodeAtom } = getMol(PickAndPlopMolecule);

  const HotKeysAtom = connectedAtom(
    (_, set) => {
      const fn: KeyHandler = function (event: Event, handler) {
        switch (handler.key) {
          case "ctrl+z":
            event.preventDefault();
            set(UndoAtom);
            break;
          case "ctrl+shift+z":
          case "ctrl+y":
            event.preventDefault();
            set(RedoAtom);
            break;
          // case 'd':
          // case 'backspace':
          case "delete":
            event.preventDefault();
            set(DeleteSelectedAtom);
            break;
          case "esc":
            event.preventDefault();
            set(ClearSelectionAtom);
            set(PickedNodeAtom, undefined);
            break;
          default:
        }
      };

      const keys = "ctrl+y,ctrl+shift+z,ctrl+z,delete,backspace,d,esc";

      // Binds hot keys
      hotkeys(keys, fn);

      return { keys, fn };
    },
    (state) => {
      state && hotkeys.unbind(state.keys, state.fn);
    },
  );
  return { HotKeysAtom };
});
