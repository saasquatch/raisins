import { RaisinNode } from '@raisins/core';
import { PrimitiveAtom } from 'jotai';
import {
  createScope,
  molecule,
  ScopeProvider,
  useMolecule,
} from 'jotai-molecules';
import React from 'react';
import { RootNodeAtom } from '../core/CoreAtoms';
import { nodeAtomWithSoulSaved } from './nodeAtomWithSoulSaved';

export const NodeScope = createScope<PrimitiveAtom<RaisinNode>>(RootNodeAtom);
/**
 * Uses atom for the "current node"
 *
 * Since this returns an atom, it should be performant and not cause the context re-rendering side
 * effects of just including `[state,setState]` in the context.
 *
 * @returns
 */
export const useNodeAtom = () => useMolecule(NodeAtomMolecule);
export const NodeAtomMolecule = molecule((_, getScope) => getScope(NodeScope));

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
  // Provides an important step -- saves souls to prevent spurious rerenders
  const value = nodeAtomWithSoulSaved(nodeAtom);
  return (
    <ScopeProvider scope={NodeScope} value={value}>
      {children}
    </ScopeProvider>
  );
};
