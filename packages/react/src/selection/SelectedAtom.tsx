import { getNode, getPath, RaisinNode } from '@raisins/core';
import { atom } from 'jotai';
import { InternalStateAtom, InternalState, idToNode } from '../hooks/CoreAtoms';

export const SelectedAtom = atom(
  (get) => get(InternalStateAtom).selected,
  (_, set, next?: RaisinNode) => {
    set(InternalStateAtom, (prev: InternalState) => {
      // TODO: Allows for selecting nodes that aren't part of the current tree. 
      // That doesn't make sense and should be prevented
      return {
        ...prev,
        selected: next
          ? { type: 'node', path: getPath(prev.current, next)! }
          : undefined,
      };
    });
  }
);

export const SelectedNodeAtom = atom<RaisinNode | undefined>((get) => {
  const { current } = get(InternalStateAtom);
  const selected = get(SelectedAtom);
  return selected?.path ? getNode(current, selected.path) : undefined;
});

export const SetSelectedIdAtom = atom(null, (_, set, id: string) =>
  set(SelectedAtom, idToNode.get(id)!)
);
