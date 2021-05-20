import { NewState, StateUpdater } from "../util/NewState";
import hotkeys from 'hotkeys-js';
import { useEffect, useMemo, useState } from '@saasquatch/universal-hooks';
import { duplicate, getParents, insertAt, move, remove, replace } from '../html-dom/util';
import { getSlots } from '../component-metamodel/getSlots';
import { ComponentModel } from './useComponentModel';
import { RaisinNode, RaisinNodeWithChildren } from '../html-dom/RaisinNode';
import serializer from '../html-dom/serializer';
import { InternalState } from './useEditor';

export function useCore(metamodel: ComponentModel, initial: RaisinNode) {
  // const [selected, setSelected] = useState<RaisinNode>(undefined);
  const [state, setState] = useState<InternalState>({
    redoStack: [],
    undoStack: [],
    current: initial,
    slots: getSlots(initial, metamodel.getComponentMeta),
  });

  const undo = () =>
    setState(previous => {
      if (!previous.undoStack.length) {
        console.log('No undo', previous);
        return previous;
      }
      const [current, ...undoStack] = previous.undoStack;
      const redoStack = [previous.current, ...previous.redoStack];

      const nextCurrent = current;
      const newState = {
        current: nextCurrent,
        undoStack,
        redoStack,
        slots: getSlots(nextCurrent, metamodel.getComponentMeta),
        selected: previous.selected,
      };
      console.log('Undo to');
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
        slots: getSlots(nextCurrent, metamodel.getComponentMeta),
        selected: previous.selected,
      };
      console.log('Setting to');
      return newState;
    });

  function generateNextState(previous: InternalState, nextNode: RaisinNode, newSelection?: RaisinNode) {
    const undoStack = [previous.current, ...previous.undoStack];
    const newState = {
      selected: newSelection,
      current: nextNode,
      undoStack,
      redoStack: [],
      slots: getSlots(nextNode, metamodel.getComponentMeta),
    };
    console.log('Setting to');
    return newState;
  }

  const setSelected = (next: RaisinNode) => {
    setState(prev => {
      // TODO: Allows for selecting nodes that aren't part of the current tree
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
      const currentIdx = parent.children.indexOf(n);
      const clone = move(previousState, n, parent, currentIdx - 1);
      return clone;
    }, n);
  }
  function moveDown(n: RaisinNode) {
    setNodeInternal(previousState => {
      const parent = parents.get(n);
      const currentIdx = parent.children.indexOf(n);
      const clone = move(previousState, n, parent, currentIdx + 1);
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
      const newState = {
        selected: newSelection,
        current: nextRoot,
        undoStack,
        redoStack: [],
        slots: getSlots(nextRoot, metamodel.getComponentMeta),
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
        case 'd':
        case 'backspace':
        case 'delete':
          event.preventDefault();
          deleteSelected();
        default:
      }
    });
  }, []);

  const parents = useMemo(() => getParents(state.current), [state.current]);
  function getAncestry(node: RaisinNode): RaisinNodeWithChildren[] {
    let ancestry: RaisinNodeWithChildren[] = [];
    let current = node;
    while (current) {
      const parent = parents.get(current);
      if (parent) {
        ancestry.push(parent);
      }
      current = parent;
    }
    return ancestry;
  }
  const slots = getSlots(state.current, metamodel.getComponentMeta);
  return {
    initial: serializer(initial),

    node: state.current,
    parents,
    getAncestry,
    slots,

    selected: state.selected,
    setSelected,
    selectParent,

    removeNode,
    duplicateNode,
    insert: insertNode,
    moveDown,
    moveUp,
    replaceNode,
    setNode,
    setNodeInternal,

    undo,
    redo,
    hasRedo: state.redoStack.length > 0,
    hasUndo: state.undoStack.length > 0,
  };
}
