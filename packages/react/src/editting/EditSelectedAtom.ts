import { htmlUtil } from '@raisins/core';
import { atom } from 'jotai';
import { PickedAtom } from '../atoms/pickAndPlopAtoms';
import { InternalStateAtom } from '../hooks/CoreAtoms';
import { SelectedAtom, SelectedNodeAtom } from '../selection/SelectedAtom';
import { DuplicateNodeAtom, generateNextState } from './EditAtoms';

const {
  removePath,
} = htmlUtil;

/**
 * Deletes the selected node, if anything selected, otherwise no-op
 */

export const DeleteSelectedAtom = atom(null, (get, set) => {
  set(InternalStateAtom, (previous) => {
    if (previous.selected) {
      const clone = removePath(previous.current, previous.selected.path);
      return generateNextState(previous, clone);
    }
    return previous;
  });
});

export const DuplicateSelectedAtom = atom(null, (get, set) => {
  const selected = get(SelectedNodeAtom);
  selected && set(DuplicateNodeAtom, selected);
});

export const PickSelectedAtom = atom(null, (get, set) => {
  const selected = get(SelectedAtom);
  selected && set(PickedAtom, selected.path);
});
