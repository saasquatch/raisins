import { RaisinNode } from '@raisins/core';
import { PrimitiveAtom } from 'jotai';
import React, { useContext } from 'react';
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
