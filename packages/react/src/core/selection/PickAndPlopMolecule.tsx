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

      // The stored path may dangle if the document changed since pick time
      // (undo/redo, external edits) — a dangling pick resolves to undefined.
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
   * The content being picked: the block's content for adds, the resolved
   * document node for moves, or undefined when nothing is picked. The pick
   * half of the "plop candidate" used by plop validation.
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
      // The destination parent may no longer be in the document (it changed
      // since the plop targets were shown) — abandon the plop rather than
      // crash downstream on an unresolvable path.
      const parentPath = getPath(currentDoc, parent);
      if (!parentPath) {
        set(PickedAtom, undefined);
        return;
      }

      if (picked.type === 'block') {
        // Clone first, then set the slot — the block definition is shared
        // metamodel config and must never be mutated.
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
