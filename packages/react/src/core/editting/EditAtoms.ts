import {
  getNode,
  getPath,
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
  const { InternalStateAtom, RootNodeAtom } = getMol(CoreMolecule);
  const { SoulsAtom, SoulSaverAtom } = getMol(SoulsMolecule);
  const SetNodeInternalAtom = atom(
    null,
    (get, set, next: SetStateAction<RaisinNode>) => {
      set(InternalStateAtom, (previous) => {
        const nextNode =
          typeof next === 'function' ? next(previous.current) : next;
        return generateNextState(previous, nextNode, false);
      });
    }
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
      set(InternalStateAtom, (previous) => {
        let newSelection: RaisinNode;
        const nextRoot = replace(
          previous.current,
          prev,
          next,
          (old: RaisinNode, replacement: RaisinNode) => {
            if (
              previous.selected &&
              old === getNode(previous.current, previous.selected.path)
            ) {
              newSelection = replacement;
            }
            return soulSaver(old, replacement);
          }
        );

        const undoStack = [previous.current, ...previous.undoStack];
        const newState: InternalState = {
          ...previous,
          selected: {
            type: 'node',
            path: getPath(nextRoot, newSelection!)!,
          },
          current: nextRoot,
          undoStack,
          redoStack: [],
        };
        return newState;
      });
    }
  );

  const ReplacePathAtom = atom(
    null,
    (get, set, { prev, next }: { prev: NodePath; next: RaisinNode }) => {
      set(InternalStateAtom, (previous) => {
        const nextRoot = replacePath(
          previous.current,
          prev,
          next,
          get(SoulSaverAtom)
        );

        const undoStack = [previous.current, ...previous.undoStack];
        const newState: InternalState = {
          ...previous,
          selected: previous.selected,
          current: nextRoot,
          undoStack,
          redoStack: [],
        };
        return newState;
      });
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
  nextNode: RaisinNode,
  clearSelection = false
) {
  const undoStack = [previous.current, ...previous.undoStack];
  const newState: InternalState = {
    selected: clearSelection ? undefined : previous.selected,
    // newSelection === undefined
    //   ? undefined
    //   : {
    //       type: 'node',
    //       path: getPath(nextNode, newSelection)!,
    //     },
    current: nextNode,
    undoStack,
    redoStack: [],
  };
  return newState;
}
