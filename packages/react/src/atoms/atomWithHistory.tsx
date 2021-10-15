import { Atom, atom, PrimitiveAtom, WritableAtom } from 'jotai';
import { atomWithSetStateListener } from './atomWithSetterListener';

export type Action<T> = HistoryAction | { type: 'update'; value: T };
export type HistoryAction = { type: 'undo' } | { type: 'redo' };

export type HistoryAtom<T> = WritableAtom<T, Action<T>>;

export function atomWithHistoryListener<T>(
  baseAtom: PrimitiveAtom<T>
): [PrimitiveAtom<T>, HistoryAtom<T>, Atom<{ undo: T[]; redo: T[] }>] {
  /**
   * Top-oriented stacks, so the first item in the array is the top of the stack
   */
  const history = atom({
    undo: [] as T[],
    redo: [] as T[],
  });

  const wrapped = atomWithSetStateListener(baseAtom, (get, set, prev, next) => {
    // Updates history when baseAtom is updated
    set(history, (prevHistory) => {
      return {
        // Previous value gets added to the top of the undo stack
        undo: [prev, ...prevHistory.undo],
        // Redo gets cleared
        redo: [],
      };
    });
  });

  const atomWithHistory = atom<T, Action<T>>(
    (get) => get(baseAtom),
    (get, set, action) => {
      const { undo, redo } = get(history);
      const current = get(baseAtom);
      if (action.type === 'update') {
        // Delegates to the wrapped listener above
        set(wrapped, action.value);
      } else if (action.type === 'undo' && undo.length > 0) {
        const [top, ...rest] = undo;
        set(history, {
          // Undo stack is shorter
          undo: [...rest],
          // Previous active value goes into redo
          redo: [current, ...redo],
        });
        // Undo value pushed in
        set(baseAtom, top);
      } else if (action.type === 'redo' && redo.length > 0) {
        const [top, ...rest] = redo;
        set(history, {
          // Previous active value goes into redo
          undo: [current, ...undo],
          // redo stack is shorter
          redo: [...rest],
        });
        // Undo value pushed in
        set(baseAtom, top);
      }
    }
  );

  return [wrapped, atomWithHistory, atom((get) => get(history))];
}
