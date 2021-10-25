import {
  getNode,
  getPath,
  htmlParser,
  htmlSerializer as serializer,
  htmlUtil,
  NodePath,
  NodeSelection,
  RaisinNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { atom, useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { useEffect, useMemo } from 'react';
import { CoreModel } from '../model/EditorModel';
import { NewState, StateUpdater } from '../util/NewState';
import { ComponentModel } from '../component-metamodel/useComponentModel';

type InternalState = {
  current: RaisinNode;
  undoStack: RaisinNode[];
  redoStack: RaisinNode[];
  selected?: NodeSelection;
};

const {
  duplicate,
  getParents,
  insertAt,
  move,
  remove,
  removePath,
  replace,
  replacePath,
  getAncestry: getAncestryUtil,
} = htmlUtil;

const nodeToId = new WeakMap<RaisinNode, string>();
const idToNode = new Map<string, RaisinNode>();

export function getId(node: RaisinNode): string {
  const existing = nodeToId.get(node);
  if (existing) {
    return existing;
  }
  const id = 'node-' + Math.round(Math.random() * 10000);
  nodeToId.set(node, id);
  idToNode.set(id, node);
  return id;
}

// Should be made private
export const InternalStateAtom = atom<InternalState>({
  redoStack: [],
  undoStack: [],
  current: htmlParser('<div></div>'),
});

export const SelectedAtom = atom(
  (get) => get(InternalStateAtom).selected,
  (get, set, next?: RaisinNode) => {
    set(InternalStateAtom, (prev: InternalState) => {
      // TODO: Allows for selecting nodes that aren't part of the current tree. That doesn't make sense and should be prevented
      return {
        ...prev,
        selected: next
          ? { type: 'node', path: getPath(prev.current, next)! }
          : undefined,
      };
    });
  }
);

export const RootNodeAtom = atom((get) => get(InternalStateAtom).current);

export const SelectedNodeAtom = atom<RaisinNode | undefined>((get) => {
  const { current } = get(InternalStateAtom);
  const selected = get(SelectedAtom);
  return selected?.path ? getNode(current, selected.path) : undefined;
});

export const SetSelectedIdAtom = atom(null, (get, set, id: string) =>
  set(SelectedAtom, idToNode.get(id)!)
);

/**
 * Derived map of parents
 */
export const ParentsAtom = atom((get) => {
  const doc = get(InternalStateAtom).current;
  return getParents(doc);
});

export const DeleteSelectedAtom = atom(null, (get, set) => {
  set(InternalStateAtom, (previous) => {
    if (previous.selected) {
      const clone = removePath(previous.current, previous.selected.path);
      return generateNextState(previous, clone);
    }
    return previous;
  });
});

function generateNextState(
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

export function useCore(
  metamodel: ComponentModel,
  initial: RaisinNode
): CoreModel {
  const [{ current }, setState] = useAtom(InternalStateAtom);

  useEffect(() => {
    setState({ redoStack: [], undoStack: [], current: initial });
  }, [initial]);

  const deleteSelected = useUpdateAtom(DeleteSelectedAtom);
  const [selected, setSelected] = useAtom(SelectedAtom);

  function setNodeInternal(next: NewState<RaisinNode>, clearSelection = false) {
    setState((previous) => {
      const nextNode =
        typeof next === 'function' ? next(previous.current) : next;
      return generateNextState(previous, nextNode, clearSelection);
    });
  }
  const setNode: StateUpdater<RaisinNode> = (n) => setNodeInternal(n);

  const setHtml: StateUpdater<string> = (html) => {
    const nextHtml = typeof html === 'function' ? html(serialized) : html;
    const nextNode = htmlParser(nextHtml);
    setNodeInternal(nextNode);
  };

  function removeNode(n: RaisinNode) {
    setNodeInternal((previous: RaisinNode) => remove(previous, n), undefined);
  }
  function duplicateNode(n: RaisinNode) {
    const clone = duplicate(current, n);
    setNodeInternal(clone, true);
  }

  function insertNode(
    n: RaisinNode,
    parent: RaisinNodeWithChildren,
    idx: number
  ) {
    const clone = insertAt(current, n, parent, idx);
    setNode(clone);
  }
  function replaceNode(prev: RaisinNode, next: RaisinNodeWithChildren) {
    setState((previous) => {
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
  function getPathInternal(node: RaisinNode): NodePath {
    return getPath(current, node)!;
  }
  function replacePathInternal(prev: NodePath, next: RaisinNodeWithChildren) {
    setState((previous) => {
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

  const serialized = useMemo(() => serializer(current), [current]);

  const [parents] = useAtom(ParentsAtom);
  function getAncestry(node: RaisinNode): RaisinNodeWithChildren[] {
    return getAncestryUtil(current, node, parents);
  }

  return {
    initial: serializer(initial),

    node: current,
    serialized,
    html: serialized,
    setHtml,
    getAncestry,

    selected: selected?.path ? getNode(current, selected.path) : undefined,
    setSelected,

    getId,

    deleteSelected,
    removeNode,
    duplicateNode,
    insert: insertNode,
    replaceNode,
    replacePath: replacePathInternal,
    setNode,
    getPath: getPathInternal,
  };
}
