import { htmlUtil, RaisinNode } from '@raisins/core';
import { atom, SetStateAction } from 'jotai';
import { molecule } from 'jotai-molecules';
import { isFunction } from '../../util/isFunction';
import { CoreMolecule } from '../CoreAtoms';
import { PickAndPlopMolecule } from '../selection/PickAndPlopMolecule';
import { SelectedNodeMolecule } from '../selection/SelectedNodeMolecule';
import { EditMolecule, generateNextState } from './EditAtoms';

const { removePath } = htmlUtil;

export const EditSelectedMolecule = molecule((getMol) => {
  const { InternalStateAtom } = getMol(CoreMolecule);
  const { DuplicateNodeAtom, ReplaceNodeAtom } = getMol(EditMolecule);
  const { SelectedAtom, SelectedNodeAtom } = getMol(SelectedNodeMolecule);

  const { PickedAtom } = getMol(PickAndPlopMolecule);

  /**
   * Deletes the selected node, if anything selected, otherwise no-op
   */
  const DeleteSelectedAtom = atom(null, (get, set) => {
    set(InternalStateAtom, (previous) => {
      if (previous.selected) {
        const clone = removePath(previous.current, previous.selected.path);
        return generateNextState(previous, clone);
      }
      return previous;
    });
  });

  const DuplicateSelectedAtom = atom(null, (get, set) => {
    const selected = get(SelectedNodeAtom);
    selected && set(DuplicateNodeAtom, selected);
  });

  const ClearSelectionAtom = atom(null, (_, set) => {
    set(SelectedAtom, undefined);
  });

  const PickSelectedAtom = atom(null, (get, set) => {
    const selected = get(SelectedAtom);
    selected && set(PickedAtom, { type: 'element', path: selected.path });
  });

  const EditSelectedNodeAtom = atom(
    (get) => get(SelectedNodeAtom)!,
    (get, set, next: SetStateAction<RaisinNode>) => {
      const selected = get(SelectedNodeAtom);
      if (!selected) return; // Don't allow editing if nothing selected
      const nextValue = isFunction(next) ? next(selected) : next;
      set(ReplaceNodeAtom, {
        prev: selected,
        next: nextValue,
      });
    }
  );

  return {
    DeleteSelectedAtom,
    DuplicateSelectedAtom,
    PickSelectedAtom,
    ClearSelectionAtom,
    EditSelectedNodeAtom,
  };
});
