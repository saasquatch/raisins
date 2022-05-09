import { Atom, atom } from 'jotai';
import { createMemoizeAtom } from '../weakCache';

const memoized = createMemoizeAtom();
const strictIsEqual = <T,>(a: T, b: T) => a === b;

/**
 * Creates a derived atom that checks for equality before returning a new value.
 *
 * Useful alongside shallow equal or deep equal checks.
 */
export function atomWithEqualCheck<T>(
  baseAtom: Atom<T>,
  isEqual: (prev: T, next: T) => boolean = strictIsEqual
) {
  return memoized(() => {
    const refAtom = atom({ current: undefined as T | undefined });

    const derivedAtom = atom((get) => {
      const next = get(baseAtom);
      const prev = get(refAtom);

      if (prev.current === undefined) {
        prev.current = next;
        return next;
      }
      if (isEqual(prev.current, next)) {
        return prev.current;
      }
      prev.current = next;
      return next;
    });
    return derivedAtom;
  }, [baseAtom, isEqual]);
}
