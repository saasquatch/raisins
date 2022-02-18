import { getPath, NodePath, RaisinNode } from '@raisins/core';
import { Atom, atom, PrimitiveAtom } from 'jotai';
import { RootNodeAtom } from '../../core/CoreAtoms';
import { createMemoizeAtom } from '../../util/weakCache';

const memoizeAtom = createMemoizeAtom();

export function atomForNodePath(
  baseAtom: PrimitiveAtom<RaisinNode>
): Atom<NodePath | undefined> {
  return memoizeAtom(
    () =>
      atom((get) => {
        const rootEl = get(RootNodeAtom);
        const node = get(baseAtom);
        const path = getPath(rootEl, node);
        if (!path) {
          // TODO: Should never be null
          // throw new Error("Could not find node's path in root.")
        }
        return path;
      }),
    [baseAtom]
  );
}
