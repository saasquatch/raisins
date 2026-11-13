import { isElementNode, type RaisinNode } from '@raisins/core';
import { type Atom, atom, type PrimitiveAtom } from 'jotai';
import { createMemoizeAtom } from '../../util/weakCache.ts';

const memoized = createMemoizeAtom();

export function atomForTagName(
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
