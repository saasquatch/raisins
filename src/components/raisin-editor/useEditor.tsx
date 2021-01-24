import htmlparser2 from 'htmlparser2';
import serialize from 'dom-serializer';
import { Model, NodeWithSlots, StateUpdater } from '../../model/Dom';
import hotkeys from 'hotkeys-js';
import { useEffect, useHost, useMemo, useState } from '@saasquatch/stencil-hooks';
import { duplicate, getParent, move, remove, replace } from '../../util';
import { useDND } from './useDragState';
import { getSlots } from './getSlots';
import { useInlinedHTML } from './useInlinedHTML';
import { useComponentModel } from './useComponentModel';
import { RaisinNode, RaisinNodeWithChildren } from '../../model/RaisinNode';

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
  const host = useHost();
  const initial = useMemo(() => {
    const html = host.querySelectorAll('template')[0].innerHTML;
    return htmlparser2.parseDocument(html);
  }, []);

  // const [selected, setSelected] = useState<RaisinNode>(undefined);
  const [state, setState] = useState<InternalState>({
    redoStack: [],
    undoStack: [],
    current: initial,
    slots: getSlots(initial),
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
        slots: getSlots(nextCurrent),
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
        slots: getSlots(nextCurrent),
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
  const setNode: StateUpdater<RaisinNode> = next => {
    setState(previous => {
      const nextNode = typeof next === 'function' ? next(previous.current) : next;
      const undoStack = [previous.current, ...previous.undoStack];
      const newState = {
        current: nextNode,
        undoStack,
        redoStack: [],
        slots: getSlots(nextNode),
      };
      console.log(
        'Setting to',
        // serialize(newState.current),
        // newState.undoStack.map(x => serialize(x)),
        // newState.redoStack.map(x => serialize(x)),
      );
      return newState;
    });
  };

  function removeNode(n: RaisinNode) {
    const clone = remove(state.current, n);
    setNode(clone);
  }
  function duplicateNode(n: RaisinNode) {
    const clone = duplicate(state.current, n);
    setNode(clone);
  }
  function moveUp(n: RaisinNode) {
    const parent = getParent(state.current, n);
    const currentIdx = parent.children.indexOf(n);
    const clone = move(state.current, n, parent, currentIdx - 1);
    setNode(clone);
  }
  function moveDown(n: RaisinNode) {
    const parent = getParent(state.current, n);
    const currentIdx = parent.children.indexOf(n);
    const clone = move(state.current, n, parent, currentIdx + 1);
    setNode(clone);
  }
  function replaceNode(prev: RaisinNode, next: RaisinNodeWithChildren) {
    setState(previous => {
      const nextNode = replace(state.current, prev, next);
      const undoStack = [previous.current, ...previous.undoStack];
      const selected = previous.selected === prev ? next : undefined;
      const newState = {
        selected,
        current: nextNode,
        undoStack,
        redoStack: [],
        slots: getSlots(nextNode),
      };
      console.log(
        'Setting to',
        // serialize(newState.current),
        // newState.undoStack.map(x => serialize(x)),
        // newState.redoStack.map(x => serialize(x)),
      );
      return newState;
    });
  }

  useEffect(() => {
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
          if (state.selected) {
            removeNode(state.selected);
          }
        default:
      }
    });
  }, []);

  const slots = getSlots(state.current);
  return {
    initial: serialize(initial),

    node: state.current,
    slots,
    getId,

    selected: state.selected,
    setSelected,

    removeNode,
    duplicateNode,
    moveDown,
    moveUp,
    replaceNode,

    undo,
    redo,
    hasRedo: state.redoStack.length > 0,
    hasUndo: state.undoStack.length > 0,

    ...useComponentModel(),
    ...useInlinedHTML({ setNode }),
    ...useDND({ node: state.current, setNode }),
  };
}

export function moveTargetRelative(target: any, x: any, y: any) {
  // target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  // // update the posiion attributes
  // target.setAttribute('data-x', x);
  // target.setAttribute('data-y', y);
  // TODO: Surface state so that stencil to handle the transforms?
}
