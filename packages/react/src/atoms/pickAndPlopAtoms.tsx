import {
    getPath,
  htmlUtil,
  isElementNode,
  RaisinNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { atom } from 'jotai';
import { SetNodeInternalAtom } from '../editting/EditAtoms';
import { RootNodeAtom } from '../hooks/CoreAtoms';

const { remove, insertAtPath, clone } = htmlUtil;

/**
 * For tracking which atom is picked. Can only have one atom picked at a time.
 */
export const pickedAtom = atom<RaisinNode | undefined>(undefined);

/**
 * For tracking if a node can be plopped
 */
export const ploppingIsActive = atom((get) => get(pickedAtom) !== undefined);

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
    const pickedNode = get(pickedAtom);
    if (!pickedNode) {
      // Nothing is picked, so do nothing;
      return;
    }

    const currrentDoc = get(RootNodeAtom);
    const parentPath = getPath(currrentDoc,parent)!;
    const docWithNodeRemoved = remove(currrentDoc, pickedNode);

    const cloneOfPickedNode = clone(pickedNode);
    const newNode = !isElementNode(cloneOfPickedNode) ? {...cloneOfPickedNode} : {...cloneOfPickedNode, attribs:{...cloneOfPickedNode.attribs, slot}};
    const newDocument = insertAtPath(docWithNodeRemoved, newNode, parentPath, idx);

    set(SetNodeInternalAtom, newDocument);

    // Don't allow re-plop
    set(pickedAtom, undefined);
  }
);
