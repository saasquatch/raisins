import {
  getNode,
  getPath,
  isElementNode,
  NodeSelection,
  RaisinNode,
} from '@raisins/core';
import { atom, Getter, SetStateAction } from 'jotai';
import { molecule } from 'jotai-molecules';
import { isFunction } from '../../util/isFunction';
import { CoreMolecule } from '../CoreAtoms';
import { Soul, SoulsMolecule } from '../souls/Soul';
import { SoulsInDocMolecule } from '../souls/SoulsInDocumentAtoms';

export const SelectedNodeMolecule = molecule((getMol) => {
  const { RootNodeAtom } = getMol(CoreMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);
  const { SoulToNodeAtom } = getMol(SoulsInDocMolecule);

  const InternalSelectedAtom = atom(undefined as NodeSelection | undefined);

  const SelectedAtom = atom(
    (get) => get(InternalSelectedAtom),
    (get, set, next?: RaisinNode | undefined) => {
      set(InternalSelectedAtom, (prev: NodeSelection | undefined) => {
        // TODO: Allows for selecting nodes that aren't part of the current tree.
        // That doesn't make sense and should be prevented
        if (!next) return undefined;
        return { type: 'node', path: getPath(get(RootNodeAtom), next)! };
      });
    }
  );

  function getSelected(get: Getter) {
    const root = get(RootNodeAtom);
    const selected = get(SelectedAtom);
    return selected?.path ? getNode(root, selected.path) : undefined;
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
