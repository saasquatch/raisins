import {
  htmlUtil,
  NodePath,
  RaisinNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { atom, SetStateAction } from 'jotai';
import { molecule } from 'jotai-molecules';
import { CoreMolecule, InternalState } from '../CoreAtoms';
import { SoulsMolecule } from '../souls/Soul';

const { duplicate, insertAt, remove, replace, replacePath } = htmlUtil;

export const EditMolecule = molecule((getMol) => {
  const { RootNodeAtom } = getMol(CoreMolecule);
  const { SoulsAtom, SoulSaverAtom } = getMol(SoulsMolecule);
  const SetNodeInternalAtom = atom(
    null,
    (_, set, next: SetStateAction<RaisinNode>) => set(RootNodeAtom, next)
  );
  SetNodeInternalAtom.debugLabel = 'SetNodeInternalAtom';

  /**
   * Deletes a raisin node from the document
   */
  const RemoveNodeAtom = atom(null, (get, set, toRemove: RaisinNode) =>
    set(SetNodeInternalAtom, (previous: RaisinNode) =>
      remove(previous, toRemove, get(SoulSaverAtom))
    )
  );

  /**
   * Deletes a raisins node, adding a duplicate as a sibling in the document
   */
  const DuplicateNodeAtom = atom(null, (get, set, toClone: RaisinNode) => {
    const current = get(RootNodeAtom);
    const souls = get(SoulsAtom);
    const clone = duplicate(current, toClone, get(SoulSaverAtom));
    set(SetNodeInternalAtom, clone);
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
      const current = get(RootNodeAtom);
      const clone = insertAt(current, n, parent, idx, get(SoulSaverAtom));
      set(SetNodeInternalAtom, clone);
    }
  );

  /**
   * Replaces a node with a new node
   */
  const ReplaceNodeAtom = atom(
    null,
    (get, set, { prev, next }: { prev: RaisinNode; next: RaisinNode }) => {
      const soulSaver = get(SoulSaverAtom);
      const nextRoot = replace(
        get(RootNodeAtom),
        prev,
        next,
        (old: RaisinNode, replacement: RaisinNode) => {
          return soulSaver(old, replacement);
        }
      );
      set(RootNodeAtom, nextRoot);
    }
  );

  const ReplacePathAtom = atom(
    null,
    (get, set, { prev, next }: { prev: NodePath; next: RaisinNode }) => {
      const nextRoot = replacePath(
        get(RootNodeAtom),
        prev,
        next,
        get(SoulSaverAtom)
      );
      set(RootNodeAtom, nextRoot);
    }
  );
  return {
    RootNodeAtom,
    SetNodeInternalAtom,
    RemoveNodeAtom,
    DuplicateNodeAtom,
    InsertNodeAtom,
    ReplaceNodeAtom,
    ReplacePathAtom,
  };
});

export function generateNextState(
  previous: InternalState,
  nextNode: RaisinNode
) {
  const undoStack = [previous.current, ...previous.undoStack];
  const newState: InternalState = {
    current: nextNode,
    undoStack,
    redoStack: [],
  };
  return newState;
}
