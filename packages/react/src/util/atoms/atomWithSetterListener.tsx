import { atom, Getter, PrimitiveAtom, Setter } from 'jotai';
import { isFunction } from '../isFunction';
import { createMemoizeAtom } from '../weakCache';

const memoizeAtom = createMemoizeAtom();
export type SetStateListener<T> = (
  get: Getter,
  set: Setter,
  previousValue: T,
  nextValue: T
) => void | Promise<void>;

/**
 * Wraps a primitive atom with the ability to
 */
export function atomWithSetStateListener<T>(
  baseAtom: PrimitiveAtom<T>,
  listener: SetStateListener<T>
): PrimitiveAtom<T> {
  return memoizeAtom(
    () =>
      atom(
        (get) => get(baseAtom),
        (get, set, next) => {
          const prevValue = get(baseAtom);
          const nextValue = isFunction(next) ? next(prevValue) : next;
          listener(get, set, prevValue, nextValue);
          set(baseAtom, nextValue);
        }
      ),
    [baseAtom, listener]
  );
}
