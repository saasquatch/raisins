import { RaisinNode } from '@raisins/core';
import { PrimitiveAtom, useAtom } from 'jotai';
import { splitAtom } from 'jotai/utils';
import { atomForChildren } from '../atoms/atomForChildren';
import { atomWithId } from '../atoms/atomWithId';
import { atomWithNodeProps } from '../atoms/atomWithNodeProps';
import { atomWithSelection } from '../atoms/atomWithSelection';
import { isElementNode, isRoot } from '../util/isNode';
import { polymorphicAtom } from '../atoms/polymorphicAtom';
import { RaisinScope } from '../atoms/RaisinScope';

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

  const [
    childAtoms,
    // TODO: At some point, figure out how to provide `removeChild` down the tree.
    removeChild,
  ] = useAtom(childrenOrUndefined, RaisinScope) ?? [undefined, undefined];

  return {
    childAtoms: childAtoms?.map(atomWithId) ?? [],
  };
}

export function getDerivedAtoms(base: PrimitiveAtom<RaisinNode>) {
  return {
    node: base,
    selected: atomWithSelection(base),
    nodeProps: atomWithNodeProps(base),
  };
}
