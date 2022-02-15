import { isElementNode, RaisinNode } from '@raisins/core';
import { Atom, atom, PrimitiveAtom } from 'jotai';
import { createMemoizeAtom } from '../atoms/weakCache';

const memoized = createMemoizeAtom();

export function tagNameForNode(
  base: PrimitiveAtom<RaisinNode>
): Atom<string | undefined> {
  return memoized(
    () =>
      atom((get) => {
        const node = get(base);
        if (isElementNode(node)) return node.tagName;
        return undefined;
      }),
    [base]
  );
}
