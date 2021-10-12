import { getPath, RaisinNode } from '@raisins/core';
import { atom, PrimitiveAtom } from 'jotai';
import { createMemoizeAtom } from './weakCache';
import { root } from './_atoms';

const memoizeAtom = createMemoizeAtom();

export function atomWithNodePath(baseAtom: PrimitiveAtom<RaisinNode>) {
  return memoizeAtom(
    () =>
      atom((get) => {
        const rootEl = get(root);
        const node = get(baseAtom);
        return getPath(rootEl, node);
      }),
    [baseAtom]
  );
}
