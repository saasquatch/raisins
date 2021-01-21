import htmlparser2 from 'htmlparser2';
import serialize from 'dom-serializer';
import { Model, NodeWithSlots, StateUpdater } from '../../model/Dom';
import * as DOMHandler from 'domhandler';
import hotkeys from 'hotkeys-js';
import { useEffect, useHost, useMemo, useState } from '@saasquatch/stencil-hooks';
import { duplicate, move, remove, replace } from '../../util';
import { useDND } from './useDragState';
import { getSlots } from './getSlots';
import { useInlinedHTML } from './useInlinedHTML';

export type InternalState = {
  immutableCopy: DOMHandler.Node;
  current: DOMHandler.Node;
  slots: NodeWithSlots;
  undoStack: DOMHandler.Node[];
  redoStack: DOMHandler.Node[];
};

export type DraggableState = Map<
  DOMHandler.Node,
  {
    element?: HTMLElement;
    handle?: HTMLElement;
  }
>;

const nodeToId = new WeakMap<DOMHandler.Node, string>();

export function getId(node: DOMHandler.Node): string {
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

  const [selected, setSelected] = useState<DOMHandler.Node>(undefined);
  const [state, setState] = useState<InternalState>({
    redoStack: [],
    undoStack: [],
    current: initial,
    immutableCopy: initial.cloneNode(true),
    slots: getSlots(initial),
  });

  const undo = () =>
    setState(previous => {
      if (!previous.undoStack.length) {
        console.log('No undo', previous);
        return previous;
      }
      const [current, ...undoStack] = previous.undoStack;
      const redoStack = [previous.immutableCopy, ...previous.redoStack];

      const nextCurrent = current.cloneNode(true);
      const newState = {
        current: nextCurrent,
        immutableCopy: current.cloneNode(true),
        undoStack,
        redoStack,
        slots: getSlots(nextCurrent),
      };
      console.log(
        'Undo to',
        serialize(newState.current),
        newState.undoStack.map(x => serialize(x)),
        newState.redoStack.map(x => serialize(x)),
      );
      return newState;
    });

  const redo = () =>
    setState(previous => {
      if (!previous.redoStack.length) {
        return previous;
      }
      const [current, ...redoStack] = previous.redoStack;
      const undoStack = [previous.immutableCopy, ...previous.undoStack];

      const nextCurrent = current.cloneNode(true);
      const newState = {
        current: nextCurrent,
        immutableCopy: current.cloneNode(true),
        undoStack,
        redoStack,
        slots: getSlots(nextCurrent),
      };
      console.log(
        'Setting to',
        serialize(newState.current),
        newState.undoStack.map(x => serialize(x)),
        newState.redoStack.map(x => serialize(x)),
      );
      return newState;
    });

  const setNode: StateUpdater<DOMHandler.Node> = next => {
    setState(previous => {
      const immutableCopy = typeof next === 'function' ? next(previous.current).cloneNode(true) : next.cloneNode(true);
      const undoStack = [previous.immutableCopy, ...previous.undoStack];
      const newState = {
        current: immutableCopy,
        immutableCopy,
        undoStack,
        redoStack: [],
        slots: getSlots(immutableCopy),
      };
      console.log(
        'Setting to',
        serialize(newState.current),
        newState.undoStack.map(x => serialize(x)),
        newState.redoStack.map(x => serialize(x)),
      );
      return newState;
    });
  };

  function removeNode(n: DOMHandler.Node) {
    const clone = remove(state.current, n);
    setNode(clone);
  }
  function duplicateNode(n: DOMHandler.Node) {
    const clone = duplicate(state.current, n);
    setNode(clone);
  }
  function moveUp(n: DOMHandler.Node) {
    const currentIdx = n.parent.children.indexOf(n);
    const clone = move(state.current, n, n.parent, currentIdx - 1);
    setNode(clone);
  }
  function moveDown(n: DOMHandler.Node) {
    const currentIdx = n.parent.children.indexOf(n);
    const clone = move(state.current, n, n.parent, currentIdx + 1);
    setNode(clone);
  }
  function replaceNode(prev: DOMHandler.Node, next: DOMHandler.NodeWithChildren) {
    const clone = replace(state.current, prev, next);
    setNode(clone);
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
          if (selected) {
            removeNode(selected);
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

    selected,
    setSelected,

    setState: setNode,
    removeNode,
    duplicateNode,
    moveDown,
    moveUp,
    replaceNode,

    undo,
    redo,
    hasRedo: state.redoStack.length > 0,
    hasUndo: state.undoStack.length > 0,

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
