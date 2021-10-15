import { atom, PrimitiveAtom, SetStateAction, WritableAtom } from 'jotai';
import { atomWithSetStateListener } from './atomWithSetterListener';

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

export function atomWithHistoryListener<T>(
  baseAtom: PrimitiveAtom<T>
): [PrimitiveAtom<T>, HistoryAtom<T>] {
  const history = atom({
    undo: [] as T[],
    redo: [] as T[],
  });

  const wrapped = atomWithSetStateListener(baseAtom, (get, set, prev, next) => {
    // Mutates history when baseAtom is updated
    set(history, (prevHistory) => {
      return { ...prevHistory, undo: [...prevHistory.undo, next], redo: [] };
    });
  });

  const atomWithHistory = atom<T, Action<T>>(
    (get) => get(baseAtom),
    (get, set, action) => {
      const { undo, redo } = get(history);
      const current = get(baseAtom);
      if (action.type === 'update') {
        set(wrapped, action.value);
      } else if (action.type === 'undo' && undo.length > 0) {
        const rest = [...undo];
        const last = rest.pop()!;
        set(history, { undo: [...rest], redo: [...redo, current] });
        set(baseAtom, last);
      } else if (action.type === 'redo' && redo.length > 0) {
        const rest = [...redo];
        const last = rest.pop()!;
        set(history, { undo: [...rest, current], redo: [...redo] });
        set(baseAtom, last);
      }
    }
  );

  return [wrapped, atomWithHistory];
}
