import { RaisinElementNode } from '@raisins/core';
import {
  getPath,
  htmlUtil,
  NodePath,
  RaisinNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { atom, PrimitiveAtom } from 'jotai';
import { molecule } from 'bunshi/react';
import { Block } from '../../component-metamodel/ComponentModel';
import { isFunction } from '../../util/isFunction';
import { tryGetNode } from '../../util/tryGetNode';
import { waitForUpdate } from '../../util/waitForUpdate';
import { CoreMolecule } from '../CoreAtoms';
import { SelectedNodeMolecule } from './SelectedNodeMolecule';

const { moveNode, insertAtPath, clone } = htmlUtil;

export type PlopDestination = {
  parent: RaisinNodeWithChildren;
  idx: number;
  slot: string;
};

export type PickedOption =
  | { type: 'element'; path: NodePath }
  | { type: 'block'; block: Block }
  | undefined;

export const PickAndPlopMolecule = molecule(getMol => {
  const { RootNodeAtom } = getMol(CoreMolecule);
  const { SelectedAtom } = getMol(SelectedNodeMolecule);

  /**
   * For tracking which atom is picked. Can only have one atom picked at a time.
   */
  const PickedAtom = atom<PickedOption>(undefined);

  const PickedNodeAtom: PrimitiveAtom<RaisinNode | undefined> = atom(
    get => {
      const currentDoc = get(RootNodeAtom);
      const picked = get(PickedAtom);
      if (!picked) return undefined;
      if (picked.type !== 'element') return undefined;

      // Dangling path (doc changed since pick) resolves to undefined.
      return tryGetNode(currentDoc, picked.path);
    },
    (get, set, next) => {
      const node = isFunction(next)
        ? (next as Function)(get(PickedNodeAtom))
        : next;

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
    get => (get(PickedAtom) !== undefined) as boolean
  );

  /**
   * Content being picked (block content for adds, resolved node for moves).
   * The pick half of the plop candidate.
   */
  const PickedContentAtom = atom<RaisinElementNode | undefined>(get => {
    const picked = get(PickedAtom);
    if (!picked) return undefined;
    if (picked.type === 'block') return picked.block.content;
    return get(PickedNodeAtom) as RaisinElementNode | undefined;
  });

  const PlopNodeInSlotAtom = atom(
    null,
    async (get, set, { parent, idx, slot }: PlopDestination) => {
      const picked = get(PickedAtom);
      if (!picked) return;

      const currentDoc = get(RootNodeAtom);
      // Destination gone from the doc — abandon rather than crash downstream.
      const parentPath = getPath(currentDoc, parent);
      if (!parentPath) {
        set(PickedAtom, undefined);
        return;
      }

      if (picked.type === 'block') {
        // Clone before setting slot — block content is shared metamodel config.
        const cloneOfPickedNode = clone(
          picked.block.content
        ) as RaisinElementNode;
        cloneOfPickedNode.attribs.slot = slot;

        const newDocument = insertAtPath(
          currentDoc,
          cloneOfPickedNode,
          parentPath,
          idx
        );
        set(RootNodeAtom, newDocument);
        await waitForUpdate();
        set(SelectedAtom, cloneOfPickedNode);
      } else {
        const pickedNode = get(PickedNodeAtom) as RaisinElementNode;

        if (!pickedNode) {
          // Nothing is picked, so do nothing;
          return;
        }
        const newDocument = moveNode(
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
    PickedContentAtom,
    PickedNodeAtom,
    PloppingIsActive,
    PlopNodeInSlotAtom,
  };
});
