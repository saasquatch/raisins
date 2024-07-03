import { RaisinNode, RaisinNodeWithChildren } from '@raisins/core';
import { PrimitiveAtom, useAtom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { splitAtom } from 'jotai/utils';
import { optic_ } from 'optics-ts';
import { polymorphicAtom } from '../../util/atoms/polymorphicAtom';
import { isElementNode, isRoot } from '../../util/isNode';
import { createMemoizeAtom } from '../../util/weakCache';
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

export function useChildAtoms(
  nodeAtom: PrimitiveAtom<RaisinNode>
): PrimitiveAtom<RaisinNode>[] {
  const childrenOrUndefined = polymorphicAtom(nodeAtom, childAtomRouter);

  const [
    childAtoms,
    // TODO: At some point, figure out how to provide `removeChild` down the tree.
    removeChild,
  ] = useAtom(childrenOrUndefined) ?? [undefined, undefined];
  // @ts-ignore TODO jotai 2 update
  return childAtoms ?? [];
}

const chilOptic = () =>
  optic_<RaisinNodeWithChildren>()
    .prop('children')
    .filter(c => isElementNode(c));

export function useChildAtomsForked(
  nodeAtom: PrimitiveAtom<RaisinNode>
): PrimitiveAtom<RaisinNode>[] {
  const childrenOrUndefined = memoize(() => {
    return splitAtom(
      // Need to replace this to not replace souls
      focusAtom(nodeAtom, chilOptic)
    );
  }, [nodeAtom]);

  const [
    childAtoms,
    // TODO: At some point, figure out how to provide `removeChild` down the tree.
    removeChild,
  ] = useAtom(childrenOrUndefined) ?? [undefined, undefined];

  return childAtoms ?? [];
}

const memoize = createMemoizeAtom();
