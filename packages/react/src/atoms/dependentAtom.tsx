import { Atom, atom } from 'jotai';

/**
 * Create an atom-in-atom that will produce an atom of `initialValue`
 * whenever the `sourceAtom` changes.
 */
export function dependentAtom<T>(sourceAtom: Atom<unknown>, initialValue: T) {
  const whichAtom = atom((get) => {
    get(sourceAtom);
    return atom<T>(initialValue);
  });

  return atom(
    (get) => get(get(whichAtom)),
    (get, set, next: T) => set(get(whichAtom), next)
  );
}
