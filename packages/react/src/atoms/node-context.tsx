import { RaisinNode } from '@raisins/core';
import { Atom, PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import type { SetAtom } from 'jotai/core/atom';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { useContext, useMemo } from 'react';
import { createMemoizeAtom } from './weakCache';
import { rootPrimitive } from './_atoms';

// TODO: allow this to be swapped out? There are likely more history listeners.
const CONTEXT = React.createContext<PrimitiveAtom<RaisinNode>>(rootPrimitive);

/**
 * Uses atom for the "current node"
 *
 * Since this returns an atom, it should be performant and not cause the context re-rendering side
 * effects of just including `[state,setState]` in the context.
 *
 * @returns
 */
export const useNodeAtom = () => useContext(CONTEXT);

/**
 * Provides the "current node" context.

*/
export const NodeAtomProvider = ({
  nodeAtom,
  children,
}: {
  nodeAtom: PrimitiveAtom<RaisinNode>;
  children: React.ReactNode;
}) => {
  const Pro = CONTEXT.Provider;
  return <Pro value={nodeAtom}>{children}</Pro>;
};

export type ScopedAtomCreator<R> = (atom: PrimitiveAtom<RaisinNode>) => Atom<R>;
export type WriteableScopedAtomCreator<R, W> = (
  atom: PrimitiveAtom<RaisinNode>
) => WritableAtom<R, W>;

/**
 * For writeable atoms
 */
export function useScopedAtom<R, W>(
  scopeFn: WriteableScopedAtomCreator<R, W>
): WritableAtom<R, W>;
/**
 * For read-only atoms
 */
export function useScopedAtom<R>(scopeFn: ScopedAtomCreator<R>): Atom<R>;

export function useScopedAtom<R, W>(
  scopeFn: WriteableScopedAtomCreator<R, W> | ScopedAtomCreator<R>
) {
  const scopedAtom = useNodeAtom();
  if (!scopedAtom) throw new Error('Undefined scope');
  const memoized = useMemo(() => scopeFn(scopedAtom), [scopedAtom, scopeFn]);
  return memoized;
}

/**
 * For writeable atoms
 */
export function atomForNode<R, W>(
  scopeFn: WriteableScopedAtomCreator<R, W>
): {
  useValue: () => R;
  useUpdate: () => SetAtom<W>;
  useAtom: () => [R, SetAtom<W>];
};
/**
 * For read-only atoms
 */
export function atomForNode<R>(
  scopeFn: ScopedAtomCreator<R>
): {
  useValue: () => R;
  useUpdate: () => never;
  useAtom: () => [R, never];
};

export function atomForNode<R, W>(
  scopeFn: WriteableScopedAtomCreator<R, W> | ScopedAtomCreator<R>
) {
  const memoized = createMemoizeAtom();
  const getAtom = (base: PrimitiveAtom<RaisinNode>) =>
    memoized(() => scopeFn(base), [scopeFn, base]);

  return {
    useValue: () => useAtomValue(useScopedAtom(getAtom)),
    useUpdate: () => useUpdateAtom(useScopedAtom(getAtom) as any),
    useAtom: () => useAtom(useScopedAtom(getAtom)),
  };
}
