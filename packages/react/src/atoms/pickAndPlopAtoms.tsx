import {
  getNode,
  getPath,
  htmlUtil,
  isElementNode,
  NodePath,
  RaisinNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { atom } from 'jotai';
import { SetNodeInternalAtom } from '../core/editting/EditAtoms';
import { RootNodeAtom } from '../core/CoreAtoms';

const { remove, insertAtPath, clone } = htmlUtil;

/**
 * For tracking which atom is picked. Can only have one atom picked at a time.
 */
export const PickedAtom = atom<NodePath | undefined>(undefined);

export const PickedNodeAtom = atom<RaisinNode | undefined>((get) => {
  const currrentDoc = get(RootNodeAtom);
  const pickedPath = get(PickedAtom);
  if (!pickedPath) return undefined;
  return getNode(currrentDoc, pickedPath);
});

/**
 * For tracking if a node can be plopped
 */
export const PloppingIsActive = atom(
  (get) => (get(PickedAtom) !== undefined) as boolean
);

export const DropPloppedNodeInSlotAtom = atom(
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
