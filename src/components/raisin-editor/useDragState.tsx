import * as DOMHandler from 'domhandler';
import { State, useRef, useState } from '@saasquatch/stencil-hooks';
import interact from 'interactjs';
import { DragCoords } from '../../model/DragCoords';
import { Interactable } from '@interactjs/core/Interactable';
import { moveTargetRelative } from './useEditor';
import { DropState } from '../../model/DropState';
import { move } from '../../util';
import { StateUpdater } from '../../model/Dom';

type Props = { node: DOMHandler.Node; setNode: StateUpdater<DOMHandler.Node> };

export function useDND(props: Props) {
  const elementToNode = useRef(new WeakMap<HTMLElement, DOMHandler.Node>()).current;
  const elementToInteract = useRef(new WeakMap<HTMLElement, Interactable>()).current;

  const sharedState = {
    elementToNode,
    elementToInteract,
    props,
  };
  return {
    ...useDragState(sharedState),
    ...useDropState(sharedState),
    elementToNode,
  };
}

type SharedState = {
  elementToNode: WeakMap<HTMLElement, DOMHandler.Node>;
  elementToInteract: WeakMap<HTMLElement, Interactable>;
  props: Props;
};

function useDragState(sharedState: SharedState) {
  const [dragCoords, setDragCoords] = useState<DragCoords>(undefined);

  function createDraggable(element: HTMLElement, node: DOMHandler.Node) {
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
    }

    return interactable;
  }

  const setDraggableRef = useDragRefs(sharedState, createDraggable);
  return { dragCoords, setDraggableRef } as const;
}

export function useDropState(sharedState: SharedState) {
  const [dropTarget, setDropTarget] = useState<DropState>(undefined);

  const setDroppableRef = useDragRefs(sharedState, (element, node) => {
    return interact(element).dropzone({
      // only accept elements matching this CSS selector
      accept: '*',
      // Require a 75% element overlap for a drop to be possible
      overlap: 0.1,

      // listen for drop related events:

      ondragenter: function (event) {
        // feedback the possibility of a drop
        // event.relatedTarget.style.background = 'green';
        // event.target.style.background = 'blue';
        setDropTarget([event.relatedTarget, event.target]);
      },
      ondragleave: function (event) {
        // remove the drop feedback style
        // 'Dragged out'
        // event.target.style.background = '';
        // event.relatedTarget.style.background = '';
        setDropTarget(undefined);
      },

      // TODO
      ondrop: function (event) {
        const dropzoneNode = sharedState.elementToNode.get(event.relatedTarget);
        const dropped = sharedState.elementToNode.get(event.target);

        sharedState.props.setNode(root => move(root, dropped, dropzoneNode, -1));
        // event.relatedTarget.style.background = 'pink';
      },

      /*
       * For dropzones only
       */
      ondropactivate: function (event) {
        // add active dropzone feedback
        // event.target.style.border = '1px dotted #CCC';
      },
      ondropdeactivate: function (event) {
        // event.target.style.border = '';
        // remove active dropzone feedback
      },
    });
  });

  return { setDroppableRef, dropTarget };
}

function useDragRefs(sharedState: SharedState, builder: (element: HTMLElement, node: DOMHandler.Node) => Interactable) {
  const setDraggableRef = (node: DOMHandler.Node, element: HTMLElement) => {
    const existing = sharedState.elementToInteract.get(element);
    if (existing) {
      // Already have drag state, do nothing.
      return;
    }
    console.log('New ref', node, element);
    const interactable = builder(element, node);

    sharedState.elementToNode.set(element, node);
    sharedState.elementToInteract.set(element, interactable);
  };
  return setDraggableRef;
}
