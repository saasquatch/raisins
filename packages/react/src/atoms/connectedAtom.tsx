import { Atom, atom, WritableAtom, Getter, Setter } from 'jotai';
import { MutableRefObject } from 'react';

/**
 * Creates a read-only atom for some external state connection that needs to be both initialized and optionally destroyed.
 *
 * Internally this wraps `atom.onMount` to provide access to both `set` and `get`.
 * 
 * @param initializer
 * @param destroy
 * @returns
 */
export default function connectedAtom<T>(
  initializer: (get: Getter, set: Setter) => T,
  destroy?: (value: T | null) => void
): Atom<T | null> {
  const ValueAtom = atom<T | null>(null);
  const ProxyAtom = atom(
    (get) => get(ValueAtom)!,
    (get, set, ref: MutableRefObject<T | null>) => {
      const value = initializer(get, set);
      ref.current = value;
      set(ValueAtom, value);
    }
  );
  ProxyAtom.onMount = (setAtom) => {
    const ref: MutableRefObject<T | null> = {
      current: null,
    };
    setAtom(ref);
    destroy && destroy(ref.current);
  };

  const ReadOnlyAtom = atom((get) => get(ProxyAtom));
  return ReadOnlyAtom;
}