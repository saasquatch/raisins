import { RaisinNode } from '@raisins/core';
import { atom, PrimitiveAtom } from 'jotai';
import {
  createScope,
  molecule,
  ScopeProvider,
  useMolecule,
} from 'jotai-molecules';
import React from 'react';
import { CoreMolecule } from '../core/CoreAtoms';
import { SoulsMolecule } from '../core/souls/Soul';
import { isFunction } from '../util/isFunction';
import { createMemoizeAtom } from '../util/weakCache';

export const NodeScope = createScope<PrimitiveAtom<RaisinNode> | undefined>(
  undefined
);
NodeScope.displayName = 'NodeScope';

/**
 * Uses atom for the "current node"
 *
 * Since this returns an atom, it should be performant and not cause the context re-rendering side
 * effects of just including `[state,setState]` in the context.
 *
 * @returns
 */
export const useNodeAtom = () => useMolecule(NodeScopeMolecule);

/**
 * An {@link PrimitiveAtom} for the node in scope (defaults to the root node of the {@link CoreMolecule})
 */
export const NodeScopeMolecule = molecule((getMol, getScope) => {
  const nodeAtom = getScope(NodeScope);
  const { RootNodeAtom } = getMol(CoreMolecule);
  const { SoulsAtom } = getMol(SoulsMolecule);

  /**
   * Creates a proxy atom of `nodeAtom` that preserves the
   * soul of the node when it is updated.
   *
   * Memoized internally based on `nodeAtom` to prevent creating
   * atoms all the time.
   *
   * @param nodeAtom - the atom to wrap/proxy
   * @returns a proxy atom with soul saved
   */
  function nodeAtomWithSoulSaved(
    nodeAtom: PrimitiveAtom<RaisinNode>
  ): PrimitiveAtom<RaisinNode> {
    return memoized(() => {
      return atom(
        get => get(nodeAtom),
        (get, set, next) => {
          set(nodeAtom, prev => {
            const souls = get(SoulsAtom);
            const soul = souls.get(prev);
            // @ts-expect-error Not all constituents of type are callable
            const nextNode = isFunction(next) ? next(prev) : next;
            soul && souls.set(nextNode, soul);
            return nextNode;
          });
        }
      );
    }, [SoulsAtom, nodeAtom]);
  }
  return nodeAtomWithSoulSaved(nodeAtom ?? RootNodeAtom);
});

/**
 * Provides the "current node" context.
 */
export const NodeScopeProvider = ({
  nodeAtom,
  children,
}: {
  nodeAtom: PrimitiveAtom<RaisinNode>;
  children: React.ReactNode;
}) => {
  // Provides an important step -- saves souls to prevent spurious rerenders
  // const value = nodeAtomWithSoulSaved(nodeAtom);
  return (
    <ScopeProvider scope={NodeScope} value={nodeAtom}>
      {children}
    </ScopeProvider>
  );
};

const memoized = createMemoizeAtom();
