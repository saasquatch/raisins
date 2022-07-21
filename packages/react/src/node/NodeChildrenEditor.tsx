import { RaisinNode } from '@raisins/core';
import { PrimitiveAtom } from 'jotai';
import React, { useContext } from 'react';
import { useChildAtomsForked } from './children/childAtomRouter';
import { NodeScopeProvider, useNodeAtom } from './NodeScope';

const useChildAtoms = useChildAtomsForked;

export type NodeChildrenEditorProps = {
  Component: React.ComponentType<{ idx?: number }>;
};
/**
 * Provides a simple way of handling recursive controllers.
 *
 * This is just a wrapper around `useNodeAtom`, `useChildAtoms` and `NodeAtomProvider`, but you probably
 * want to use it instead of writing your own boilerplate.
 *
 * @param props.Component - the inner component that will be rendered for each child
 * @returns
 */
export function NodeChildrenEditor({ Component }: NodeChildrenEditorProps) {
  const base = useNodeAtom();
  const childAtoms = useChildAtoms(base);
  return (
    <ChildrenEditorForAtoms Component={Component} childAtoms={childAtoms} />
  );
}

type ChildComponentType = React.ComponentType<{
  idx?: number;
}>;

export function ChildrenEditorForAtoms({
  Component,
  childAtoms,
}: {
  Component: ChildComponentType;
  childAtoms: PrimitiveAtom<RaisinNode>[];
}) {
  return (
    <>
      {childAtoms.map((childAtom, idx: number) => {
        return (
          <NodeScopeProvider nodeAtom={childAtom} key={`${childAtom}`}>
            <Component idx={idx} />
          </NodeScopeProvider>
        );
      })}
    </>
  );
}
/*


  FORKED



*/
export const ForkedContext = React.createContext<
  undefined | PrimitiveAtom<RaisinNode>
>(undefined);
export function ForkedChildrenEditor({
  Component,
}: {
  Component: React.FC<{ idx: number }>;
}) {
  const base = useContext(ForkedContext);
  const childAtoms = useChildAtoms(base!);
  return (
    <>
      {childAtoms.map((childAtom, idx: number) => {
        return (
          <ForkedContext.Provider value={childAtom} key={`${childAtom}`}>
            <Component idx={idx} />
          </ForkedContext.Provider>
        );
      })}
    </>
  );
}
