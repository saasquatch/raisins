import { Model, NewState, NodeWithSlots, StateUpdater } from '../../model/Dom';
import hotkeys from 'hotkeys-js';
import { useEffect, useHost, useMemo, useState } from '@saasquatch/stencil-hooks';
import { duplicate, getParents, insertAt, move, remove, replace, visit } from '../../util';
import { useDND } from './useDragState';
import { getSlots } from './getSlots';
import { useInlinedHTML } from './useInlinedHTML';
import { useComponentModel } from './useComponentModel';
import { RaisinNode, RaisinNodeWithChildren } from '../../model/RaisinNode';
import serializer from '../../model/serializer';
import { parse } from '../../model/parser';
import useCanvas from './useCanvas';

export type Mode = 'preview' | 'edit';

export type InternalState = {
  current: RaisinNode;
  slots: NodeWithSlots;
  undoStack: RaisinNode[];
  redoStack: RaisinNode[];
  selected?: RaisinNode;
};

export type DraggableState = Map<
  RaisinNode,
  {
    element?: HTMLElement;
    handle?: HTMLElement;
  }
>;

const nodeToId = new WeakMap<RaisinNode, string>();

export function getId(node: RaisinNode): string {
  const existing = nodeToId.get(node);
  if (existing) {
    return existing;
  }
  const id = 'node-' + Math.round(Math.random() * 10000);
  nodeToId.set(node, id);
  return id;
}

export function useEditor(): Model {
  const metamodel = useComponentModel();
  const host = useHost();
  const [mode, setMode] = useState<Mode>('edit');
  const initial = useMemo(() => {
    const html = host.querySelectorAll('template')[0].innerHTML;
    const raisinNode = parse(html);
    visit(raisinNode, {
      onText(text) {
        if (!text.data.trim()) {
          console.log('Prased to blank!', text);
        } else {
          console.log('Parsed to not blank!', text);
        }
      },
    });
    return raisinNode;
  }, []);

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
      console.log(
        'Undo to',
        // serialize(newState.current),
        // newState.undoStack.map(x => serialize(x)),
        // newState.redoStack.map(x => serialize(x)),
      );
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
      console.log(
        'Setting to',
        // serialize(newState.current),
        // newState.undoStack.map(x => serialize(x)),
        // newState.redoStack.map(x => serialize(x)),
      );
      return newState;
    });

  const setSelected = (next: RaisinNode) => {
    setState(prev => {
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
      return generateNextState(previous, newSelection, nextNode, metamodel);
    });
  }
  const setNode: StateUpdater<RaisinNode> = n => setNodeInternal(n);

  function removeNode(n: RaisinNode) {
    const clone = remove(state.current, n);
    setNodeInternal(clone);
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
        return generateNextState(previous, undefined, clone, metamodel);
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
    getId,

    selected: state.selected,
    setSelected,
    selectParent,

    removeNode,
    duplicateNode,
    insert: insertNode,
    moveDown,
    moveUp,
    replaceNode,

    undo,
    redo,
    hasRedo: state.redoStack.length > 0,
    hasUndo: state.undoStack.length > 0,

    mode,
    setMode,
    ...metamodel,
    ...useCanvas({ selected: state.selected }),
    ...useInlinedHTML({ setNode }),
    ...useDND({ node: state.current, setNode, parents, componentModel: metamodel }),
  };
}
function generateNextState(previous: InternalState, newSelection, nextNode, metamodel) {
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
