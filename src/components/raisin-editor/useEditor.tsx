import htmlparser2 from 'htmlparser2';
import serialize from 'dom-serializer';
import { Model } from '../../model/Dom';
import * as DOMHandler from 'domhandler';
import hotkeys from 'hotkeys-js';
import { useEffect, useMemo, useState } from '@saasquatch/stencil-hooks';
import { remove } from '../../util';

export type InternalState = {
  immutableCopy: DOMHandler.Node;
  current: DOMHandler.Node;
  undoStack: DOMHandler.Node[];
  redoStack: DOMHandler.Node[];
};

export function useEditor(html: string): Model {
  const initial = useMemo(() => htmlparser2.parseDocument(html), []);
  const [selected, setSelected] = useState<DOMHandler.Node>(undefined);
  const [state, setState] = useState<InternalState>({
    redoStack: [],
    undoStack: [],
    current: initial,
    immutableCopy: initial.cloneNode(true),
  });
  const undo = () =>
    setState(previous => {
      if (!previous.undoStack.length) {
        console.log('No undo', previous);
        return previous;
      }
      const [current, ...undoStack] = previous.undoStack;
      const redoStack = [previous.immutableCopy, ...previous.redoStack];

      const newState = {
        current: current.cloneNode(true),
        immutableCopy: current.cloneNode(true),
        undoStack,
        redoStack,
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

      const newState = {
        current: current.cloneNode(true),
        immutableCopy: current.cloneNode(true),
        undoStack,
        redoStack,
      };
      console.log(
        'Setting to',
        serialize(newState.current),
        newState.undoStack.map(x => serialize(x)),
        newState.redoStack.map(x => serialize(x)),
      );
      return newState;
    });

  const setNode = (current: DOMHandler.Node) =>
    setState(previous => {
      const immutableCopy = current.cloneNode(true);
      const undoStack = [previous.immutableCopy, ...previous.undoStack];
      const newState = {
        current: immutableCopy,
        immutableCopy,
        undoStack,
        redoStack: [],
      };
      console.log(
        'Setting to',
        serialize(newState.current),
        newState.undoStack.map(x => serialize(x)),
        newState.redoStack.map(x => serialize(x)),
      );
      return newState;
    });

  const removeNode = (n: DOMHandler.Node) => {
    const clone = remove(state.current, n);
    setNode(clone);
  };
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
  return {
    node: state.current,
    setState: setNode,
    selected,
    setSelected,
    removeNode,
    undo,
    redo,
    hasRedo: state.redoStack.length > 0,
    hasUndo: state.undoStack.length > 0,
  };
}
