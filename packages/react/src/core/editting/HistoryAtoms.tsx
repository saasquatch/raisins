import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { CoreMolecule } from '../CoreAtoms';

/**
 * A set of atoms for dealing with undo/redo history
 *
 */
export const HistoryMolecule = molecule((getMol) => {
  const { InternalStateAtom } = getMol(CoreMolecule);

  /**
   * Returns the sizes of the undo/redo stacks for the UI
   */
  const HistorySizeAtom = atom((get) => {
    const intState = get(InternalStateAtom);
    return {
      undoSize: intState.undoStack.length,
      redoSize: intState.redoStack.length,
    };
  });
  HistorySizeAtom.debugLabel = 'HistorySizeAtom';

  const UndoAtom = atom(null, (_, set) => {
    set(InternalStateAtom, (previous) => {
      if (!previous.undoStack.length) {
        return previous;
      }
      const [current, ...undoStack] = previous.undoStack;
      const redoStack = [previous.current, ...previous.redoStack];

      const nextCurrent = current;
      const newState = {
        ...previous,
        current: nextCurrent,
        undoStack,
        redoStack,
      };
      return newState;
    });
  });
  UndoAtom.debugLabel = 'UndoAtom';

  const RedoAtom = atom(null, (_, set) => {
    set(InternalStateAtom, (previous) => {
      if (!previous.redoStack.length) {
        return previous;
      }
      const [current, ...redoStack] = previous.redoStack;
      const undoStack = [previous.current, ...previous.undoStack];

      const nextCurrent = current;
      const newState = {
        ...previous,
        current: nextCurrent,
        immutableCopy: current,
        undoStack,
        redoStack,
      };
      return newState;
    });
  });
  RedoAtom.debugLabel = 'RedoAtom';

  return {
    HistorySizeAtom,
    UndoAtom,
    RedoAtom,
  };
});
