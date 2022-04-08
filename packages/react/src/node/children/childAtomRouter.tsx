import { RaisinNode } from '@raisins/core';
import { PrimitiveAtom, useAtom } from 'jotai';
import { splitAtom } from 'jotai/utils';
import { polymorphicAtom } from '../../util/atoms/polymorphicAtom';
import { isElementNode, isRoot } from '../../util/isNode';
import { atomForChildren } from '../atoms/atomForChildren';

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
  ] = useAtom(childrenOrUndefined) ?? [undefined, undefined];

  return {
    childAtoms: childAtoms ?? [],
  };
}
