import { getNode, getPath, isElementNode, RaisinNode } from '@raisins/core';
import { atom, Getter, SetStateAction } from 'jotai';
import { molecule } from 'jotai-molecules';
import { isFunction } from '../../util/isFunction';
import { CoreMolecule, InternalState } from '../CoreAtoms';
import { Soul, SoulsMolecule } from '../souls/Soul';
import { SoulsInDocMolecule } from '../souls/SoulsInDocumentAtoms';

export const SelectedNodeMolecule = molecule((getMol) => {
  const { InternalStateAtom } = getMol(CoreMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);
  const { SoulToNodeAtom } = getMol(SoulsInDocMolecule);

  const SelectedAtom = atom(
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

  function getSelected(get: Getter) {
    const { current } = get(InternalStateAtom);
    const selected = get(SelectedAtom);
    return selected?.path ? getNode(current, selected.path) : undefined;
  }

  const SelectedNodeAtom = atom(
    (get) => {
      return getSelected(get);
    },
    (get, set, next: SetStateAction<RaisinNode | undefined>) =>
      set(SelectedAtom, isFunction(next) ? next(getSelected(get)) : next)
  );

  const SelectedSoulAtom = atom(
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

  return {
    SelectedAtom,
    SelectedNodeAtom,
    SelectedSoulAtom,
    SelectedPathString: atom((get) => get(SelectedAtom)?.path.toString()),
    SelectedIsElement: atom((get) => isElementNode(get(SelectedNodeAtom))),
  };
});
