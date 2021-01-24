import * as DOMHandler from 'domhandler';
import { State, useRef, useState } from '@saasquatch/stencil-hooks';
import interact from 'interactjs';
import { DragCoords } from '../../model/DragCoords';
import { Interactable } from '@interactjs/core/Interactable';
import { moveTargetRelative } from './useEditor';
import { DropState, Location } from '../../model/DropState';
import { getParent, move } from '../../util';
import { StateUpdater } from '../../model/Dom';
import { css } from '@emotion/css';
import { RaisinNode } from '../../model/RaisinNode';

type Props = { node: RaisinNode; setNode: StateUpdater<RaisinNode> };

export function useDND(props: Props) {
  const elementToNode = useRef(new WeakMap<HTMLElement, RaisinNode>()).current;
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
  elementToNode: WeakMap<HTMLElement, RaisinNode>;
  elementToInteract: WeakMap<HTMLElement, Interactable>;
  props: Props;
};

function useDragState(sharedState: SharedState) {
  const [dragCoords, setDragCoords] = useState<DragCoords>(undefined);

  function createDraggable(element: HTMLElement, node: RaisinNode) {
    const handle = element.querySelector('.handle');
    const interactable = interact(element)
      .styleCursor(false)
      .draggable({
        // enable inertial throwing
        allowFrom: handle && (handle[0] as HTMLElement),
        inertia: false,
        // keep the element within the area of it's parent
        modifiers: [
          // interact.modifiers.restrict
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
            event.target.style.opacity = 1;
            event.target.style.zIndex = '';

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

      // target.style.opacity = 0.7;
      target.style.zIndex = 9;
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

const ActiveDropTarget = css`
  &: before {
    background: red !important;
    height: 6px !important;
  }
`;

export function useDropState(sharedState: SharedState) {
  const [dropTarget, setDropTarget] = useState<DropState>(undefined);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  // const [possibleDrop, setPossibleDrop] = useState<HTMLElement>(undefined)

  function getLocation(element: HTMLElement): Location {
    const node = sharedState.elementToNode.get(element);
    const parent = getParent(sharedState.props.node, node);
    return {
      model: node,
      DOM: element,
      idx: parent.children.indexOf(node),
      slot: (node as DOMHandler.Element).attribs?.slot,
    };
  }

  const setDroppableRef = useDragRefs(sharedState, (element, node, idx: number, slot: string) => {
    return interact(element).dropzone({
      // // only accept elements matching this CSS selector
      // accept: '*',
      // // Require a 75% element overlap for a drop to be possible
      // overlap: 0.1,

      // listen for drop related events:

      ondragenter: function (event) {
        // feedback the possibility of a drop
        event.relatedTarget.style.background = 'green';
        (event.target as HTMLElement).classList.add(ActiveDropTarget);
        // event.target.style.outline = '3px solid red';
        const dropzone = sharedState.elementToNode.get(event.target);

        setDropTarget({
          from: getLocation(event.relatedTarget),
          to: {
            model: dropzone,
            DOM: event.target,
            idx,
            slot,
          },
        });
        console.log('Possible drop', event.target);
      },
      ondragleave: function (event) {
        // remove the drop feedback style
        // 'Dragged out'
        (event.target as HTMLElement).classList.remove(ActiveDropTarget);
        // event.target.style.background = '';
        event.relatedTarget.style.background = '';
        setDropTarget(undefined);
      },

      // TODO
      ondrop: function (event) {
        const dropped = sharedState.elementToNode.get(event.relatedTarget);
        const dropzoneNode = sharedState.elementToNode.get(event.target);

        console.log('Dropped', dropped, 'into', dropzoneNode);
        // @ts-ignore
        const position = idx as number;
        sharedState.props.setNode(root => {
          console.log('Moving', dropped, 'to', dropzoneNode, 'at idx', position);
          return move(root, dropped, dropzoneNode, position);
        });
        // event.relatedTarget.style.background = 'pink';
      },

      /*
       * For dropzones only
       */
      ondropactivate: function (event) {
        // add active dropzone feedback
        // event.target.style.border = '1px dotted #CCC';
        setIsDragActive(true);
      },
      ondropdeactivate: function (event) {
        setIsDragActive(false);
        // event.target.style.border = '';
        // remove active dropzone feedback
      },
    });
  });

  return { setDroppableRef, dropTarget, isDragActive };
}

function useDragRefs(sharedState: SharedState, builder: (element: HTMLElement, node: RaisinNode, ...args: unknown[]) => Interactable) {
  const setDraggableRef = (node: RaisinNode, element: HTMLElement, ...args: unknown[]) => {
    // Don't care about refs being nulled out
    if (!element) return;

    const existing = sharedState.elementToInteract.get(element);
    if (existing) {
      // Already have drag state, do nothing.
      return;
    }
    // console.log('New ref', node, element);

    const interactable = builder(element, node, ...args);

    sharedState.elementToNode.set(element, node);
    sharedState.elementToInteract.set(element, interactable);
  };
  return setDraggableRef;
}
