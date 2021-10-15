import { getPath, NodePath, RaisinNode } from '@raisins/core';
import { Atom, atom, PrimitiveAtom } from 'jotai';
import { createMemoizeAtom } from './weakCache';
import { root } from './_atoms';

const memoizeAtom = createMemoizeAtom();

export function atomWithNodePath(
  baseAtom: PrimitiveAtom<RaisinNode>
): Atom<NodePath | undefined> {
  return memoizeAtom(
    () =>
      atom((get) => {
        const rootEl = get(root);
        const node = get(baseAtom);
        const path = getPath(rootEl, node);
        if(!path){
          throw new Error("Could not find node's path in root.")
        }
        return path;
      }),
    [baseAtom]
  );
}
