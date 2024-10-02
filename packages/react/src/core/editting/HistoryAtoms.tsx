import { RaisinNode } from '@raisins/core';
import { atom, WritableAtom } from 'jotai';
import { molecule } from 'bunshi/react';
import { waitForUpdate } from '../../util/waitForUpdate';
import { CoreMolecule } from '../CoreAtoms';
import { SelectedNodeMolecule, Selection } from '../selection';

type HistoryState = {
  node: RaisinNode;
  selection?: Selection;
};
/**
 * A set of atoms for dealing with undo/redo history
 *
 */
export const HistoryMolecule = molecule(getMol => {
  const {
    InternalTransactionAtom,
    StateListeners,
    RootNodeAtom,
    rerenderNodeAtom,
  } = getMol(CoreMolecule);
  const { SelectionAtom } = getMol(SelectedNodeMolecule);

  const undoAtoms = branchAtoms<HistoryState>();
  const redoAtoms = branchAtoms<HistoryState>();

  const onChangeAtom = atom(
    null,
    (get, set, { prev, next }: { prev: RaisinNode; next: RaisinNode }) => {
      set(undoAtoms.push, { node: prev, selection: get(SelectionAtom) });
      set(redoAtoms.resetStack);
    }
  );
  StateListeners.add(onChangeAtom);

  /**
   * Returns the sizes of the undo/redo stacks for the UI
   */
  const HistorySizeAtom = atom(get => {
    return {
      undoSize: get(undoAtoms.stack).length,
      redoSize: get(redoAtoms.stack).length,
    };
  });
  HistorySizeAtom.debugLabel = 'HistorySizeAtom';

  const UndoAtom = atom(null, async (_, set) => {
    set(rerenderNodeAtom, true);
    set(
      undoAtoms.pop,
      atom(null, (get, set, next: HistoryState) => {
        set(redoAtoms.forcePush, {
          node: get(RootNodeAtom),
          selection: get(SelectionAtom),
        });
        set(SelectionAtom, next.selection);
        set(InternalTransactionAtom, { type: 'raw-set', next: next.node });
      })
    );
    await waitForUpdate();
    set(rerenderNodeAtom, false);
  });
  UndoAtom.debugLabel = 'UndoAtom';

  const RedoAtom = atom(null, async (_, set) => {
    set(rerenderNodeAtom, true);
    set(
      redoAtoms.pop,
      atom(null, (get, set, next: HistoryState) => {
        set(undoAtoms.forcePush, {
          node: get(RootNodeAtom),
          selection: get(SelectionAtom),
        });
        set(InternalTransactionAtom, { type: 'raw-set', next: next.node });
        set(SelectionAtom, next.selection);
      })
    );
    await waitForUpdate();
    set(rerenderNodeAtom, false);
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

  const pop = atom(
    null,
    (get, set, target: WritableAtom<unknown, T[], void>) => {
      const items = get(stack);
      if (items.length <= 0) {
        // Can't pop an empty stack
        return;
      }
      const [item, ...rest] = items;

      set(prevTime, undefined);
      set(stack, rest);
      set(target, item);
    }
  );

  return {
    stack,
    resetStack,
    forcePush,
    push,
    pop,
  };
}
