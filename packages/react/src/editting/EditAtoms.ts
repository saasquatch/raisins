import {
  getNode,
  getPath,
  htmlUtil,
  NodePath,
  RaisinNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { atom, SetStateAction } from 'jotai';
import {
  InternalState,
  InternalStateAtom,
  RootNodeAtom,
} from '../hooks/CoreAtoms';

const {
  duplicate,
  insertAt,
  remove,
  removePath,
  replace,
  replacePath,
} = htmlUtil;

export const SetNodeInternalAtom = atom(
  null,
  (get, set, next: SetStateAction<RaisinNode>) => {
    set(InternalStateAtom, (previous) => {
      const nextNode =
        typeof next === 'function' ? next(previous.current) : next;
      return generateNextState(previous, nextNode, false);
    });
  }
);
export const RemoveNodeAtom = atom(null, (_, set, toRemove: RaisinNode) =>
  set(SetNodeInternalAtom, (previous: RaisinNode) => remove(previous, toRemove))
);
export const DuplicateNodeAtom = atom(null, (get, set, toClone: RaisinNode) => {
  const current = get(RootNodeAtom);
  const clone = duplicate(current, toClone);
  set(SetNodeInternalAtom, clone);
});

export const InsertNodeAtom = atom(
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
    const clone = insertAt(current, n, parent, idx);
    set(SetNodeInternalAtom, clone);
  }
);

export const DeleteSelectedAtom = atom(null, (get, set) => {
  set(InternalStateAtom, (previous) => {
    if (previous.selected) {
      const clone = removePath(previous.current, previous.selected.path);
      return generateNextState(previous, clone);
    }
    return previous;
  });
});

export const ReplaceNodeAtom = atom(
  null,
  (_, set, { prev, next }: { prev: RaisinNode; next: RaisinNode }) => {
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

export const ReplacePathAtom = atom(
  null,
  (get, set, { prev, next }: { prev: NodePath; next: RaisinNode }) => {
    set(InternalStateAtom, (previous) => {
      const nextRoot = replacePath(previous.current, prev, next);

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
