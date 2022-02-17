import type { Atom, WritableAtom } from 'jotai';

/**
 * Function type that builds an Atom
 */
export type ScopedAtomCreator<R, T> = (atom: T) => Atom<R>;

/**
 * Function type that builds an WriteableAtom
 */
export type WriteableScopedAtomCreator<R, W, T> = (
  atom: T
) => WritableAtom<R, W>;
