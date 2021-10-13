import { Atom, atom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { useEffect, useRef } from 'react';

/**
 * Creates a derived atom from a react render value
 *
 * Useful for bridging between useState and Atoms
 *
 * @param value
 * @returns
 */
export function useValueAtom<T>(value: T): Atom<T> {
  const nodeAtom = useRef(atom(value)).current;
  const update = useUpdateAtom(nodeAtom);
  useEffect(() => {
    update(value);
  }, [value, update]);

  return nodeAtom;
}
