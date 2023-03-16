import { htmlUtil, RaisinNode } from '@raisins/core';
import { atom, SetStateAction } from 'jotai';
import { molecule } from 'jotai-molecules';
import { isFunction } from '../../util/isFunction';
import { PickAndPlopMolecule } from '../selection/PickAndPlopMolecule';
import { SelectedNodeMolecule } from '../selection/SelectedNodeMolecule';
import { EditMolecule } from './EditAtoms';

export const EditSelectedMolecule = molecule((getMol) => {
  const { DuplicateNodeAtom, ReplaceNodeAtom, RemoveNodeAtom } = getMol(
    EditMolecule
  );
  const { SelectedAtom, SelectedNodeAtom } = getMol(SelectedNodeMolecule);

  const { PickedAtom } = getMol(PickAndPlopMolecule);

  /**
   * Deletes the selected node, if anything selected, otherwise no-op
   */
  const DeleteSelectedAtom = atom(null, (get, set) => {
    const selected = get(SelectedNodeAtom);
    if (!selected) return;
    set(RemoveNodeAtom, selected);
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
      // @ts-expect-error Not all constituents of type are callable
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
