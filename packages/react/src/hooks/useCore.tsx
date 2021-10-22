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
import { getSlots } from '../model/getSlots';
import { NewState, StateUpdater } from '../util/NewState';
import { ComponentModel } from './useComponentModel';

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

export const InternalStateAtom = atom<InternalState>({
  redoStack: [],
  undoStack: [],
  current: htmlParser('<div></div>'),
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
  const [state, setState] = useAtom(InternalStateAtom);
  useEffect(() => {
    setState({ redoStack: [], undoStack: [], current: initial });
  }, [initial]);

  const deleteSelected = useUpdateAtom(DeleteSelectedAtom);

  const setSelected = (next?: RaisinNode) => {
    setState((prev: InternalState) => {
      // TODO: Allows for selecting nodes that aren't part of the current tree. That doesn't make sense and should be prevented
      return {
        ...prev,
        selected: next
          ? { type: 'node', path: getPath(prev.current, next)! }
          : undefined,
      };
    });
  };

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
    const clone = duplicate(state.current, n);
    setNodeInternal(clone, true);
  }
  function moveUp(n: RaisinNode) {
    // TODO: Move selection up at same time
    setNodeInternal((previousState: RaisinNode) => {
      const parent = parents.get(n);
      const currentIdx = parent!.children.indexOf(n);
      const clone = move(previousState, n, parent!, currentIdx - 1);
      return clone;
    });
  }
  function moveDown(n: RaisinNode) {
    // TODO: Move selection down at same time
    setNodeInternal((previousState: RaisinNode) => {
      const parent = parents.get(n);
      const currentIdx = parent!.children.indexOf(n);
      const clone = move(previousState, n, parent!, currentIdx + 1);
      return clone;
    });
  }
  function insertNode(
    n: RaisinNode,
    parent: RaisinNodeWithChildren,
    idx: number
  ) {
    const clone = insertAt(state.current, n, parent, idx);
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
    return getPath(state.current, node)!;
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

  const { current } = state;
  const serialized = useMemo(() => serializer(current), [current]);
  const parents = useMemo(() => getParents(current), [current]);

  const slots = useMemo(() => getSlots(current, metamodel.getComponentMeta), [
    metamodel,
    current,
  ]);

  function getAncestry(node: RaisinNode): RaisinNodeWithChildren[] {
    return getAncestryUtil(state.current, node, parents);
  }

  const setSelectedId = (id: string) => setSelected(idToNode.get(id)!);
  return {
    initial: serializer(initial),

    node: state.current,
    serialized,
    html: serialized,
    setHtml,
    parents,
    getAncestry,
    slots,

    selected: state.selected?.path
      ? getNode(state.current, state.selected.path)
      : undefined,
    setSelected,

    getId,
    setSelectedId,

    deleteSelected,
    removeNode,
    duplicateNode,
    insert: insertNode,
    moveDown,
    moveUp,
    replaceNode,
    replacePath: replacePathInternal,
    setNode,
    getPath: getPathInternal,
  };
}
