import { RaisinNode } from '@raisins/core';
import { atom, WritableAtom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { CoreMolecule } from '../CoreAtoms';

/**
 * A set of atoms for dealing with undo/redo history
 *
 */
export const HistoryMolecule = molecule((getMol) => {
  const { InternalTransactionAtom, StateListeners, RootNodeAtom } = getMol(
    CoreMolecule
  );

  const undoAtoms = branchAtoms<RaisinNode>();
  const redoAtoms = branchAtoms<RaisinNode>();

  const onChangeAtom = atom(
    null,
    (_, set, { prev, next }: { prev: RaisinNode; next: RaisinNode }) => {
      set(undoAtoms.push, prev);
      set(redoAtoms.resetStack);
    }
  );
  StateListeners.add(onChangeAtom);

  /**
   * Returns the sizes of the undo/redo stacks for the UI
   */
  const HistorySizeAtom = atom((get) => {
    return {
      undoSize: get(undoAtoms.stack).length,
      redoSize: get(redoAtoms.stack).length,
    };
  });
  HistorySizeAtom.debugLabel = 'HistorySizeAtom';

  const UndoPop = atom(null, (get, set, next: RaisinNode) => {
    set(redoAtoms.forcePush, get(RootNodeAtom));
    set(InternalTransactionAtom, { type: 'raw-set', next });
  });
  const UndoAtom = atom(null, (_, set) => {
    set(undoAtoms.pop, UndoPop);
  });
  UndoAtom.debugLabel = 'UndoAtom';

  const RedoAtom = atom(null, (_, set) => {
    set(
      redoAtoms.pop,
      atom(null, (get, set, next: RaisinNode) => {
        set(undoAtoms.forcePush, get(RootNodeAtom));
        set(InternalTransactionAtom, { type: 'raw-set', next });
      })
    );
  });
  RedoAtom.debugLabel = 'RedoAtom';

  return {
    HistorySizeAtom,
    UndoAtom,
    RedoAtom,
  };
});

/**
 *  The delay between changes after which a new group should be
 *  started. Defaults to 500 (milliseconds).
 */
const newGroupDelay = 500;

/**
 * Creates a set of atoms for a Branch. For history there should be 2 branches
 * (1 for undo, 1 for redo)
 *
 * @returns
 */
export function branchAtoms<T>() {
  const prevTime = atom<number | undefined>(Date.now());
  // A stack of items. The newest should be at the FRONT of the array.
  const stack = atom<T[]>([]);
  const resetStack = atom(null, (_, set) => set(stack, []));
  const forcePush = atom(null, (get, set, item: T) =>
    set(stack, [item, ...get(stack)])
  );

  const push = atom(null, (get, set, item: T) => {
    const now = Date.now();
    const time = get(prevTime);
    // TODO: Need a story / test for this group delay
    if (!time || now - time > newGroupDelay) {
      set(prevTime, now);
      set(forcePush, item);
    } else {
      // Doesn't create a history entry
    }
  });

  const pop = atom(null, (get, set, target: WritableAtom<unknown, T>) => {
    const items = get(stack);
    const [item, ...rest] = items;

    set(prevTime, undefined);
    set(stack, rest);
    set(target, item);
  });

  return {
    stack,
    resetStack,
    forcePush,
    push,
    pop,
  };
}
