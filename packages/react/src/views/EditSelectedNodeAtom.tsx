import { RaisinNode } from '@raisins/core';
import { atom, SetStateAction } from 'jotai';
import { ReplaceNodeAtom } from '../editting/EditAtoms';
import { SelectedNodeAtom } from '../selection/SelectedAtom';
import { isFunction } from '../util/isFunction';


export const EditSelectedNodeAtom = atom(
  (get) => get(SelectedNodeAtom)!,
  (get, set, next: SetStateAction<RaisinNode>) => {
    const selected = get(SelectedNodeAtom);
    if (!selected)
      return; // Don't allow editing if nothing selected
    const nextValue = isFunction(next) ? next(selected) : next;
    set(ReplaceNodeAtom, {
      prev: selected,
      next: nextValue,
    });
  }
);
