import { type RaisinNode, type RaisinNodeWithChildren } from '@raisins/core';
import { type Atom, type PrimitiveAtom, useAtom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { splitAtom } from 'jotai/utils';
import { optic_ } from 'optics-ts';
import { polymorphicAtom } from '../../util/atoms/polymorphicAtom.tsx';
import { isElementNode, isRoot } from '../../util/isNode.tsx';
import { createMemoizeAtom } from '../../util/weakCache.ts';
import { atomForChildren } from '../atoms/atomForChildren.tsx';

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
  const childrenOrUndefined = polymorphicAtom(
    nodeAtom,
    childAtomRouter
  ) as Atom<unknown>;

  const [
    childAtoms,
    // TODO: At some point, figure out how to provide `removeChild` down the tree.
    removeChild,
  ] = useAtom(childrenOrUndefined) ?? [undefined, undefined];

  return (childAtoms as PrimitiveAtom<RaisinNode>[]) ?? [];
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

  return (childAtoms as PrimitiveAtom<RaisinNode>[]) ?? [];
}

const memoize = createMemoizeAtom();
