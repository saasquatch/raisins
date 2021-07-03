import { useEffect, useMemo, useState } from 'react';
import hotkeys from 'hotkeys-js';
import { getSlots } from '../model/getSlots';
import { RaisinNode, RaisinNodeWithChildren, htmlUtil, htmlSerializer as serializer, htmlParser } from '@raisins/core';

import { NewState, StateUpdater } from '../util/NewState';
import { ComponentModel } from './useComponentModel';
import { InternalState } from './useEditor';
import { CoreModel, HistoryModel } from '../model/EditorModel';

const { duplicate, getParents, insertAt, move, remove, replace, getAncestry: getAncestryUtil } = htmlUtil;

const nodeToId = new WeakMap<RaisinNode, string>();
const idToNode = new Map<string, RaisinNode>();

export function getId(node: RaisinNode): string {
  const existing = nodeToId.get(node);
  if (existing) {
    return existing;
  }
  const id = 'node-' + Math.round(Math.random() * 10000);
  nodeToId.set(node, id);
  idToNode.set(id,node);
  return id;
}

export function useCore(metamodel: ComponentModel, initial: RaisinNode):CoreModel & HistoryModel {
  // const [selected, setSelected] = useState<RaisinNode>(undefined);
  const [state, setState] = useState<InternalState>({
    redoStack: [],
    undoStack: [],
    current: initial,
  });

  const undo = () =>
    setState(previous => {
      if (!previous.undoStack.length) {
        return previous;
      }
      const [current, ...undoStack] = previous.undoStack;
      const redoStack = [previous.current, ...previous.redoStack];

      const nextCurrent = current;
      const newState = {
        current: nextCurrent,
        undoStack,
        redoStack,
        selected: previous.selected,
      };
      return newState;
    });

  const redo = () =>
    setState(previous => {
      if (!previous.redoStack.length) {
        return previous;
      }
      const [current, ...redoStack] = previous.redoStack;
      const undoStack = [previous.current, ...previous.undoStack];

      const nextCurrent = current;
      const newState = {
        current: nextCurrent,
        immutableCopy: current,
        undoStack,
        redoStack,
        selected: previous.selected,
      };
      return newState;
    });

  function generateNextState(previous: InternalState, nextNode: RaisinNode, newSelection?: RaisinNode) {
    const undoStack = [previous.current, ...previous.undoStack];
    const newState: InternalState = {
      selected: newSelection,
      current: nextNode,
      undoStack,
      redoStack: [],
    };
    return newState;
  }

  const setSelected = (next: RaisinNode) => {
    setState(prev => {
      // TODO: Allows for selecting nodes that aren't part of the current tree. That doesn't make sense and should be prevented
      return {
        ...prev,
        selected: next,
      };
    });
  };
  const selectParent = () => {
    setState(prev => {
      if (prev.selected) {
        const parent = parents.get(prev.selected);
        if (parent) {
          return {
            ...prev,
            selected: parent,
          };
        }
      }
      return prev;
    });
  };
  function setNodeInternal(next: NewState<RaisinNode>, newSelection?: RaisinNode) {
    setState(previous => {
      const nextNode = typeof next === 'function' ? next(previous.current) : next;
      return generateNextState(previous, nextNode, newSelection);
    });
  }
  const setNode: StateUpdater<RaisinNode> = n => setNodeInternal(n);

  const setHtml: StateUpdater<string> = html => {
    const nextHtml = typeof html === 'function' ? html(serialized) : html;
    const nextNode = htmlParser(nextHtml);
    setNodeInternal(nextNode);
  };

  function removeNode(n: RaisinNode) {
    setNodeInternal(previous => remove(previous, n), undefined);
  }
  function duplicateNode(n: RaisinNode) {
    const clone = duplicate(state.current, n);
    setNodeInternal(clone, n);
  }
  function moveUp(n: RaisinNode) {
    setNodeInternal(previousState => {
      const parent = parents.get(n);
      const currentIdx = parent!.children.indexOf(n);
      const clone = move(previousState, n, parent!, currentIdx - 1);
      return clone;
    }, n);
  }
  function moveDown(n: RaisinNode) {
    setNodeInternal(previousState => {
      const parent = parents.get(n);
      const currentIdx = parent!.children.indexOf(n);
      const clone = move(previousState, n, parent!, currentIdx + 1);
      return clone;
    }, n);
  }
  function insertNode(n: RaisinNode, parent: RaisinNodeWithChildren, idx: number) {
    const clone = insertAt(state.current, n, parent, idx);
    setNode(clone);
  }
  function replaceNode(prev: RaisinNode, next: RaisinNodeWithChildren) {
    setState(previous => {
      let newSelection: RaisinNode;
      const nextRoot = replace(previous.current, prev, next, (old, replacement) => {
        if (old === previous.selected) {
          newSelection = replacement;
        }
      });

      const undoStack = [previous.current, ...previous.undoStack];
      const newState: InternalState = {
        // @ts-ignore
        selected: newSelection,
        current: nextRoot,
        undoStack,
        redoStack: [],
      };
      return newState;
    });
  }
  function deleteSelected() {
    setState(previous => {
      if (previous.selected) {
        const clone = remove(previous.current, previous.selected);
        return generateNextState(previous, clone);
      }
      return previous;
    });
  }

  useEffect(() => {
    // TODO: Scope so that backspace and delete only work depending on what is "focused"
    // TODO: Cleanup listeners on onmount so that the shortcuts don't live forever (e.g. and mess up program engine installation)
    hotkeys('ctrl+y,ctrl+z,delete,backspace,d', function (event, handler) {
      switch (handler.key) {
        case 'ctrl+z':
          event.preventDefault();
          undo();
          break;
        case 'ctrl+y':
          event.preventDefault();
          redo();
          break;
        // case 'd':
        // case 'backspace':
        case 'delete':
          event.preventDefault();
          deleteSelected();
          break;
        default:
      }
    });
  }, []);

  const {current} = state;
  const serialized = useMemo(() => serializer(current), [current]);
  const parents = useMemo(() => getParents(current), [current]);

  const slots = useMemo(() => getSlots(current, metamodel.getComponentMeta), [metamodel, current]);

  function getAncestry(node: RaisinNode): RaisinNodeWithChildren[] {
    return getAncestryUtil(state.current, node, parents);
  }

  const setSelectedId = (id:string) => setSelected(idToNode.get(id)!);
  return {
    initial: serializer(initial),

    node: state.current,
    serialized,
    setHtml,
    parents,
    getAncestry,
    slots,

    selected: state.selected,
    setSelected,
    selectParent,

    getId,
    setSelectedId,

    removeNode,
    duplicateNode,
    insert: insertNode,
    moveDown,
    moveUp,
    replaceNode,
    setNode,

    undo,
    redo,
    hasRedo: state.redoStack.length > 0,
    hasUndo: state.undoStack.length > 0,
  };
}
