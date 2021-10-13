import { atom, PrimitiveAtom, SetStateAction, WritableAtom } from 'jotai';

export type Action<T> = HistoryAction | { type: 'update'; value: T };
export type HistoryAction = { type: 'undo' } | { type: 'redo' };

export type HistoryAtom<T> = WritableAtom<T, Action<T>>;

/**
 * Undo/Redo history atom
 *
 * Based on source: https://github.com/pmndrs/jotai/issues/645#issuecomment-894864968
 */
export function atomWithHistory<T>(initialValue: T): HistoryAtom<T> {
  const historyAtom = atom({
    history: [initialValue],
    index: 0,
  });

  const atomWithHistory = atom<T, Action<T>>(
    (get) => {
      const { history, index } = get(historyAtom);
      return history[index];
    },
    (get, set, action) => {
      const { history, index } = get(historyAtom);
      if (action.type === 'update') {
        set(historyAtom, {
          history: [...history.slice(0, index + 1), action.value],
          index: index + 1,
        });
      } else if (action.type === 'undo' && index > 0) {
        set(historyAtom, { history, index: index - 1 });
      } else if (action.type === 'redo' && index < history.length - 1) {
        set(historyAtom, { history, index: index + 1 });
      }
    }
  );

  return atomWithHistory;
}

export function primitiveFromHistory<T>(
  atomWithHistory: HistoryAtom<T>
): PrimitiveAtom<T> {
  // TODO: Memoize and fix TS error
  return atom<T, SetStateAction<T>>(
    (get) => get(atomWithHistory),
    (get, set, action) => {
      const prev = get(atomWithHistory);
      // @ts-expect-error
      const next = typeof action === 'function' ? action(prev) : action;

      set(atomWithHistory, { type: 'update', value: next });
    }
  );
}
