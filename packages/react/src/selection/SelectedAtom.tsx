import { getNode, getPath, RaisinNode } from '@raisins/core';
import { atom } from 'jotai';
import { GetSoulAtom, Soul, SoulsAtom } from '../atoms/Soul';
import {
  InternalState,
  InternalStateAtom,
  SoulToNodeAtom,
} from '../hooks/CoreAtoms';

export const SelectedAtom = atom(
  (get) => get(InternalStateAtom).selected,
  (_, set, next?: RaisinNode | undefined) => {
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

export const SelectedPathString = atom(
  (get) => get(SelectedAtom)?.path.toString
);

export const SelectedNodeAtom = atom<RaisinNode | undefined>((get) => {
  const { current } = get(InternalStateAtom);
  const selected = get(SelectedAtom);
  return selected?.path ? getNode(current, selected.path) : undefined;
});

export const SelectedSoulAtom = atom(
  (get) => {
    const getSoul = get(GetSoulAtom);
    const node = get(SelectedNodeAtom);
    if (!node) return undefined;
    return getSoul(node);
  },
  (get, set, next: Soul | undefined) => {
    if (!next) {
      set(SelectedAtom, undefined);
      return;
    }
    const getNode = get(SoulToNodeAtom);
    const node = getNode(next);
    set(SelectedAtom, node);
  }
);
