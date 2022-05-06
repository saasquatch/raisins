import {
  getNode,
  getPath,
  htmlUtil,
  NodePath,
  RaisinNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { atom, PrimitiveAtom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { Block } from '../../component-metamodel/ComponentModel';
import { isFunction } from '../../util/isFunction';
import { CoreMolecule } from '../CoreAtoms';

const { remove, insertAtPath, clone } = htmlUtil;

export type PlopDestination = {
  parent: RaisinNodeWithChildren;
  idx: number;
  slot: string;
};

export type PickedOption =
  | { type: 'element'; path: NodePath }
  | { type: 'block'; block: Block }
  | undefined;

export const PickAndPlopMolecule = molecule((getMol) => {
  const { RootNodeAtom } = getMol(CoreMolecule);

  /**
   * For tracking which atom is picked. Can only have one atom picked at a time.
   */
  const PickedAtom = atom<PickedOption>(undefined);

  const PickedNodeAtom: PrimitiveAtom<RaisinNode | undefined> = atom(
    (get) => {
      const currentDoc = get(RootNodeAtom);
      const picked = get(PickedAtom);
      if (!picked) return undefined;
      if (picked.type !== 'element') return undefined;

      return getNode(currentDoc, picked.path);
    },
    (get, set, next) => {
      const node = isFunction(next) ? next(get(PickedNodeAtom)) : next;

      if (!node) {
        set(PickedAtom, undefined);
        return;
      }
      const currentDoc = get(RootNodeAtom);
      const path = getPath(currentDoc, node);
      if (!path) {
        set(PickedAtom, undefined);
      } else {
        set(PickedAtom, {
          type: 'element',
          path,
        });
      }
    }
  );

  /**
   * For tracking if a node can be plopped
   */
  const PloppingIsActive = atom(
    (get) => (get(PickedAtom) !== undefined) as boolean
  );

  const PlopNodeInSlotAtom = atom(
    null,
    (get, set, { parent, idx, slot }: PlopDestination) => {
      const picked = get(PickedAtom);
      if (!picked) return;

      const currentDoc = get(RootNodeAtom);
      const parentPath = getPath(currentDoc, parent)!;

      if (picked.type === 'block') {
        const cloneOfPickedNode = clone(picked.block.content);

        const newDocument = insertAtPath(
          currentDoc,
          cloneOfPickedNode,
          parentPath,
          idx
        );

        set(RootNodeAtom, newDocument);
      } else {
        const pickedNode = get(PickedNodeAtom);
        if (!pickedNode) {
          // Nothing is picked, so do nothing;
          return;
        }
        const newDocument = htmlUtil.moveNode(
          currentDoc,
          pickedNode,
          slot,
          parentPath,
          idx
        );

        set(RootNodeAtom, newDocument);
      }

      // Don't allow re-plop
      set(PickedAtom, undefined);
    }
  );

  return {
    PickedAtom,
    PickedNodeAtom,
    PloppingIsActive,
    PlopNodeInSlotAtom,
  };
});
