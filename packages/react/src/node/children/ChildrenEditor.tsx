import { RaisinNode } from '@raisins/core';
import { PrimitiveAtom } from 'jotai';
import React from 'react';
import { NodeAtomProvider, useNodeAtom } from '../NodeScope';
import { useChildAtoms } from './childAtomRouter';

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
    <ChildrenEditorForAtoms Component={Component} childAtoms={childAtoms} />
  );
}

export function ChildrenEditorForAtoms({
  Component,
  childAtoms,
}: {
  Component: React.FC<{ idx: number }>;
  childAtoms: PrimitiveAtom<RaisinNode>[];
}) {
  return (
    <>
      {childAtoms.map((childAtom, idx: number) => {
        return (
          <NodeAtomProvider nodeAtom={childAtom} key={`${childAtom}`}>
            <Component idx={idx} />
          </NodeAtomProvider>
        );
      })}
    </>
  );
}
