import { Atom, PrimitiveAtom } from 'jotai';

export type ReadonlyAtomWrapper<T> = (atom: Atom<T>) => Atom<T>;
export type PrimitiveAtomWrapper<T> = (
  atom: PrimitiveAtom<T>
) => PrimitiveAtom<T>;

export type AtomWrapper<T, V> =
  | ReadonlyAtomWrapper<T>
  | PrimitiveAtomWrapper<T>;
