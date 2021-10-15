import { RaisinNode } from '@raisins/core';
import { PrimitiveAtom, useAtom } from 'jotai';
import { splitAtom } from 'jotai/utils';
import { atomForChildren } from '../src/atoms/atomForChildren';
import { atomWithId } from '../src/atoms/atomWithId';
import { atomWithNodeProps } from '../src/atoms/atomWithNodeProps';
import { atomWithSelection } from '../src/atoms/atomWithSelection';
import { isElementNode, isRoot } from '../src/views/isNode';
import { polymorphicAtom } from './polymorphicAtom';

/**
 * Returns a child atom when children exist. Prevents exceptions by returning undefined when not.
 */
const childAtomRouter = (
  node: RaisinNode,
  innerNodeAtom: PrimitiveAtom<RaisinNode>
) => {
  if (isElementNode(node) || isRoot(node)) {
    return splitAtom(atomForChildren(innerNodeAtom));
  }
  return undefined;
};

export function useChildAtoms(nodeAtom: PrimitiveAtom<RaisinNode>) {
  const childrenOrUndefined = polymorphicAtom(nodeAtom, childAtomRouter);

  const [childAtoms, removeChild] = useAtom(childrenOrUndefined) ?? [
    undefined,
    undefined,
  ];

  const derivedChildAtoms = childAtoms?.map((base) => {
    const c = atomWithId(base);
    return {
      node: c,
      selected: atomWithSelection(c),
      nodeProps: atomWithNodeProps(c),
      remove: () => removeChild(base),
    };
  });

  return {
    childAtoms: derivedChildAtoms ?? [],
  };
}
