import { atom } from 'jotai';
import { InternalStateAtom } from '../CoreAtoms';

/**
 * Returns the sizes of the undo/redo stacks for the UI
 */
export const HistorySizeAtom = atom((get) => {
  const intState = get(InternalStateAtom);
  return {
    undoSize: intState.undoStack.length,
    redoSize: intState.redoStack.length,
  };
});
HistorySizeAtom.debugLabel = 'HistorySizeAtom';

export const UndoAtom = atom(null, (_, set) => {
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
      selected: previous.selected,
    };
    return newState;
  });
});
UndoAtom.debugLabel = 'UndoAtom';

export const RedoAtom = atom(null, (_, set) => {
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
      selected: previous.selected,
    };
    return newState;
  });
});
RedoAtom.debugLabel = 'RedoAtom';
