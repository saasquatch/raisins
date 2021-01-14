import { Component, Prop, h } from '@stencil/core';
import htmlparser2 from 'htmlparser2';
import serialize from 'dom-serializer';
import { Model } from '../../model/Dom';
import { Canvas } from '../../views/Canvas';
import { Layers } from '../../views/Layers';
import * as DOMHandler from 'domhandler';
import hotkeys from 'hotkeys-js';
import { useEffect, useMemo, useState, withHooks } from '@saasquatch/stencil-hooks';

type InternalState = {
  immutableCopy: DOMHandler.Node;
  current: DOMHandler.Node;
  undoStack: DOMHandler.Node[];
  redoStack: DOMHandler.Node[];
};

function useEditor(html: string): Model {
  const initial = useMemo(() => htmlparser2.parseDocument(html), []);
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
        redoStack: previous.redoStack,
      };
      console.log(
        'Setting to',
        serialize(newState.current),
        newState.undoStack.map(x => serialize(x)),
        newState.redoStack.map(x => serialize(x)),
      );
      return newState;
    });

  useEffect(() => {
    hotkeys('ctrl+y,ctrl+z', function (event, handler) {
      switch (handler.key) {
        case 'ctrl+z':
          event.preventDefault();
          undo();
          break;
        case 'ctrl+y':
          event.preventDefault();
          redo();
          break;
        default:
      }
    });
  }, []);
  return {
    node: state.current,
    setState: setNode,
  };
}

@Component({
  tag: 'raisin-editor',
})
export class Editor {
  /**
   * The first name
   */
  @Prop() html: string;

  constructor() {
    withHooks(this);
  }

  disconnectedCallback() {}

  render() {
    const model: Model = useEditor(this.html);

    const serialized = serialize(model.node);

    return (
      <div>
        <pre>{this.html}</pre>
        <pre>{serialized}</pre>
        <Canvas {...model} />
        <Layers {...model} />
      </div>
    );
  }
}
