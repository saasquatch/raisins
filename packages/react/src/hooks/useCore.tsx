import {
  htmlParser,
  htmlSerializer as serializer,
  htmlUtil,
  RaisinNode,
  RaisinNodeWithChildren,
  NodeSelection,
  NodePath,
  getPath,
  getNode,
} from '@raisins/core';
import { useMemo, useRef, useState } from 'react';

import { CoreModel, HistoryModel } from '../model/EditorModel';
import { getSlots } from '../model/getSlots';
import { NewState, StateUpdater } from '../util/NewState';
import { ComponentModel } from './useComponentModel';

type InternalState = {
  current: RaisinNode;
  undoStack: RaisinNode[];
  redoStack: RaisinNode[];
  selected?: NodeSelection;
};

/**
 * Basis for plugins. Plugins can see what has changed, and then decide it they want to allow it.
 *
 */
type StateReducer<T> = (previous: T, next: T) => T;

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

export function useCore(
  metamodel: ComponentModel,
  initial: RaisinNode
): CoreModel & HistoryModel {
  const [state, rawSetState] = useState<InternalState>({
    redoStack: [],
    undoStack: [],
    current: initial,
  });

  const plugins = useRef<StateReducer<InternalState>[]>([]);
  const setState:StateUpdater<InternalState> = (next)=>{

   rawSetState(previous=>{
     const nextValue = typeof next === "function" ? next(previous) : next;
     const reduced = plugins.current.reduce((acc,r)=>r(previous, acc),nextValue)
     return reduced;
   })
  }

  const undo = () =>
    setState((previous) => {
      if (!previous.undoStack.length) {
        return previous;
      }
      const [current, ...undoStack] = previous.undoStack;
      const redoStack = [previous.current, ...previous.redoStack];

      const nextCurrent = current;
      const newState = {
        ...previous,
        current: nextCurrent,
        undoStack,
        redoStack,
        selected: previous.selected,
      };
      return newState;
    });

  const redo = () =>
    setState((previous) => {
      if (!previous.redoStack.length) {
        return previous;
      }
      const [current, ...redoStack] = previous.redoStack;
      const undoStack = [previous.current, ...previous.undoStack];

      const nextCurrent = current;
      const newState = {
        ...previous,
        current: nextCurrent,
        immutableCopy: current,
        undoStack,
        redoStack,
        selected: previous.selected,
      };
      return newState;
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
  function deleteSelected() {
    setState((previous) => {
      if (previous.selected) {
        const clone = removePath(previous.current, previous.selected.path);
        return generateNextState(previous, clone);
      }
      return previous;
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

    undo,
    redo,
    hasRedo: state.redoStack.length > 0,
    hasUndo: state.undoStack.length > 0,
  };
}
