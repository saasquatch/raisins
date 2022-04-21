import {
  getNode,
  getPath,
  htmlUtil,
  isElementNode,
  NodePath,
  RaisinNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { atom, PrimitiveAtom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { isFunction } from '../../util/isFunction';
import { CoreMolecule } from '../CoreAtoms';
import { EditMolecule } from '../editting/EditAtoms';

const { remove, insertAtPath, clone } = htmlUtil;

export const PickedNodeMolecule = molecule((getMol) => {
  const { RootNodeAtom } = getMol(CoreMolecule);
  const { SetNodeInternalAtom } = getMol(EditMolecule);

  /**
   * For tracking which atom is picked. Can only have one atom picked at a time.
   */
  const PickedAtom = atom<NodePath | undefined>(undefined);

  const PickedNodeAtom: PrimitiveAtom<RaisinNode | undefined> = atom(
    (get) => {
      const currrentDoc = get(RootNodeAtom);
      const pickedPath = get(PickedAtom);
      if (!pickedPath) return undefined;
      return getNode(currrentDoc, pickedPath);
    },
    (get, set, next) => {
      const node = isFunction(next) ? next(get(PickedNodeAtom)) : next;

      if (!node) {
        set(PickedAtom, undefined);
        return;
      }
      const currrentDoc = get(RootNodeAtom);
      const path = getPath(currrentDoc, node);
      set(PickedAtom, path);
    }
  );

  /**
   * For tracking if a node can be plopped
   */
  const PloppingIsActive = atom(
    (get) => (get(PickedAtom) !== undefined) as boolean
  );

  const DropPloppedNodeInSlotAtom = atom(
    null,
    (
      get,
      set,
      {
        parent,
        idx,
        slot,
      }: {
        parent: RaisinNodeWithChildren;
        idx: number;
        slot: string;
      }
    ) => {
      const pickedNodePath = get(PickedAtom);
      if (!pickedNodePath) {
        // Nothing is picked, so do nothing;
        return;
      }

      const currrentDoc = get(RootNodeAtom);
      const pickedNode = getNode(currrentDoc, pickedNodePath);
      const parentPath = getPath(currrentDoc, parent)!;
      const docWithNodeRemoved = remove(currrentDoc, pickedNode);

      const cloneOfPickedNode = clone(pickedNode);

      const nodeWithNewSlot = !isElementNode(cloneOfPickedNode)
        ? { ...cloneOfPickedNode }
        : {
            ...cloneOfPickedNode,
            attribs: { ...cloneOfPickedNode.attribs, slot },
          };
      const newDocument = insertAtPath(
        docWithNodeRemoved,
        nodeWithNewSlot,
        parentPath,
        idx
      );

      set(SetNodeInternalAtom, newDocument);

      // Don't allow re-plop
      set(PickedAtom, undefined);
    }
  );

  return {
    PickedAtom,
    PickedNodeAtom,
    PloppingIsActive,
    DropPloppedNodeInSlotAtom,
  };
});
