import React from 'react';
import { useChildAtoms } from './childAtomRouter';
import { useNodeAtom, NodeAtomProvider } from '../atoms/node-context';

/**
 * Provides a simple way of handling recursive controllers.
 *
 * This is just a wrapper around `useNodeAtom`, `useChildAtoms` and `NodeAtomProvider`, but you probably
 * want to use it instead of writing your own boilerplate.
 *
 * @param props.Component - the inner component that will be rendered for each child
 * @returns
 */
export function ChildrenEditor({ Component }: { Component: React.FC }) {
  const base = useNodeAtom();
  const { childAtoms } = useChildAtoms(base);
  return (
    <>
      {childAtoms.map((childAtom) => {
        return (
          <NodeAtomProvider nodeAtom={childAtom} key={`${childAtom}`}>
            <Component />
          </NodeAtomProvider>
        );
      })}
    </>
  );
}
