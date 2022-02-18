import { getNode, getPath, RaisinNode } from '@raisins/core';
import { atom, Getter, SetStateAction } from 'jotai';
import { GetSoulAtom, Soul } from '../souls/Soul';
import { InternalState, InternalStateAtom } from '../CoreAtoms';
import { SoulToNodeAtom } from '../souls/SoulsInDocumentAtoms';
import { isFunction } from '../../util/isFunction';

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

export const SelectedNodeAtom = atom(
  (get) => {
    return getSelected(get);
  },
  (get, set, next: SetStateAction<RaisinNode | undefined>) =>
    set(SelectedAtom, isFunction(next) ? next(getSelected(get)) : next)
);

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

function getSelected(get: Getter) {
  const { current } = get(InternalStateAtom);
  const selected = get(SelectedAtom);
  return selected?.path ? getNode(current, selected.path) : undefined;
}
