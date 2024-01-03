import {
  htmlUtil,
  NodePath,
  RaisinNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { atom } from 'jotai';
import { molecule } from 'bunshi/react';
import { CoreMolecule } from '../CoreAtoms';
import { SoulsMolecule } from '../souls/Soul';

const { duplicate, insertAt, remove, replace, replacePath } = htmlUtil;

export const EditMolecule = molecule((getMol) => {
  const { RootNodeAtom } = getMol(CoreMolecule);
  const { SoulSaverAtom } = getMol(SoulsMolecule);

  /**
   * Deletes a raisin node from the document
   */
  const RemoveNodeAtom = atom(null, (get, set, toRemove: RaisinNode) =>
    set(RootNodeAtom, (previous: RaisinNode) =>
      remove(previous, toRemove, get(SoulSaverAtom))
    )
  );

  /**
   * Deletes a raisins node, adding a duplicate as a sibling in the document
   */
  const DuplicateNodeAtom = atom(null, (get, set, toClone: RaisinNode) => {
    set(RootNodeAtom, (prev) => duplicate(prev, toClone, get(SoulSaverAtom)));
  });

  /**
   * Inserts a node at a given position
   */
  const InsertNodeAtom = atom(
    null,
    (
      get,
      set,
      {
        node: n,
        parent,
        idx,
      }: {
        node: RaisinNode;
        parent: RaisinNodeWithChildren;
        idx: number;
      }
    ) => {
      set(RootNodeAtom, (prev) =>
        insertAt(prev, n, parent, idx, get(SoulSaverAtom))
      );
    }
  );

  /**
   * Replaces a node with a new node
   */
  const ReplaceNodeAtom = atom(
    null,
    (get, set, { prev, next }: { prev: RaisinNode; next: RaisinNode }) => {
      const soulSaver = get(SoulSaverAtom);
      set(RootNodeAtom, (previous) =>
        replace(
          previous,
          prev,
          next,
          (old: RaisinNode, replacement: RaisinNode) =>
            soulSaver(old, replacement)
        )
      );
    }
  );

  const ReplacePathAtom = atom(
    null,
    (get, set, { prev, next }: { prev: NodePath; next: RaisinNode }) => {
      set(RootNodeAtom, (previous) =>
        replacePath(previous, prev, next, get(SoulSaverAtom))
      );
    }
  );
  return {
    RootNodeAtom,
    RemoveNodeAtom,
    DuplicateNodeAtom,
    InsertNodeAtom,
    ReplaceNodeAtom,
    ReplacePathAtom,
  };
});
