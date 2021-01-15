import htmlparser2 from 'htmlparser2';
import serialize from 'dom-serializer';
import { Model } from '../../model/Dom';
import * as DOMHandler from 'domhandler';
import hotkeys from 'hotkeys-js';
import { useEffect, useHost, useMemo, useState } from '@saasquatch/stencil-hooks';
import { duplicate, remove } from '../../util';
import interact from 'interactjs';
import { DragCoords } from './DragCoords';
import { Interactable } from '@interactjs/core/Interactable';

export type InternalState = {
  immutableCopy: DOMHandler.Node;
  current: DOMHandler.Node;
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
  });

  const [dragMap, setDragMap] = useState<
    Map<
      DOMHandler.Node,
      {
        element: HTMLElement;
        interact: Interactable;
      }
    >
  >(new Map());
  const [dragCoords, setDragCoords] = useState<DragCoords>(undefined);
  const setDraggableRef = (node: DOMHandler.Node, element: HTMLElement) => {
    const existing = dragMap.get(node);
    if(existing && element === existing.element){
      return;
    }
    setDragMap(prev => {
      const next = new Map(prev);
      if (!element) {
        next.set(node, undefined);
        return next;
      }
      const existing = next.get(node);
      if (existing) {
        if (element === existing.element) {
          console.log("Nothing changed");
          // Nothing changed
          return prev;
        } else {
          // existing element neads to be town down
          existing.interact.unset();
        }
      }
      const interactable = interact(element)
        .styleCursor(false)
        .draggable({
          // enable inertial throwing
          allowFrom: element.querySelectorAll('.handle')[0] as HTMLElement,
          inertia: false,
          // keep the element within the area of it's parent
          modifiers: [
            // interact.modifiers.restrictRect({
            //   restriction: 'parent',
            //   endOnly: true,
            // }),
          ],
          // enable autoScroll
          autoScroll: true,

          listeners: {
            // call this function on every dragmove event
            move: dragMoveListener,

            // call this function on every dragend event
            end(event) {
              // removeNode(node);
              console.log('Drag end', event);
              // var textEl = event.target.querySelector('p');

              setDragCoords(prev => {
                if (prev && prev.element) {
                  return {
                    element: prev.element,
                    x: 0,
                    y: 0,
                  };
                }
              });
              // textEl && (textEl.textContent = 'moved a distance of ' + Math.sqrt((Math.pow(event.pageX - event.x0, 2) + Math.pow(event.pageY - event.y0, 2)) | 0).toFixed(2) + 'px');
              moveTargetRelative(event.target, 0, 0);
            },
          },
        });
      function dragMoveListener(event) {
        var target = event.target;

        setDragCoords(prev => {
          if (prev && prev.element === node) {
            return {
              element: node,
              x: event.dx + prev.x,
              y: event.dy + prev.y,
            };
          }
          return {
            element: node,
            x: event.dx,
            y: event.dy,
          };
        });

        // keep the dragged position in the data-x/data-y attributes
        // var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        // var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // translate the element
        // moveTargetRelative(target, 0, y);
      }
      console.log('Set up drag listener', node, element, interactable);
      next.set(node, { element, interact: interactable });
      return next;
    });
  };
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

  function setNode(current: DOMHandler.Node) {
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
  }
  function removeNode(n: DOMHandler.Node) {
    const clone = remove(state.current, n);
    setNode(clone);
  }
  function duplicateNode(n: DOMHandler.Node) {
    const clone = duplicate(state.current, n);
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
  return {
    node: state.current,
    initial: serialize(initial),

    selected,
    setSelected,

    setState: setNode,
    removeNode,
    duplicateNode,

    undo,
    redo,
    hasRedo: state.redoStack.length > 0,
    hasUndo: state.undoStack.length > 0,

    // setDraggableRef:noop,
    setDraggableRef,
    dragCoords,
  };
}
const noop = ()=>{};
function moveTargetRelative(target: any, x: any, y: any) {
  // target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  // // update the posiion attributes
  // target.setAttribute('data-x', x);
  // target.setAttribute('data-y', y);
  // TODO: Surface state so that stencil to handle the transforms?
}
