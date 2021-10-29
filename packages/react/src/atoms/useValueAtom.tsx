import { Atom, atom } from 'jotai';
import type { Scope } from 'jotai/core/atom';
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
export function useAtomFromRenderValue<T>(value: T, scope: Scope): Atom<T> {
  const nodeAtom = useRef(atom(value)).current;
  const update = useUpdateAtom(nodeAtom, scope);

  useEffect(() => {
    update(value);
  }, [value, update]);

  return nodeAtom;
}
