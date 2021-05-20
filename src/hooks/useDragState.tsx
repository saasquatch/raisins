import * as DOMHandler from 'domhandler';
import { useRef, useState } from '@saasquatch/universal-hooks';
import interact from 'interactjs';
import { DragCoords } from '../model/DragCoords';
import { Interactable } from '@interactjs/core/Interactable';
import { DropState, Location } from '../model/DropState';
import { move } from '../html-dom/util';
import { StateUpdater } from "../util/NewState";
import { RaisinElementNode, RaisinNode, RaisinNodeWithChildren } from '../html-dom/RaisinNode';
import { usePopper } from '../popper/usePopper';
import { ComponentModel } from './useComponentModel';

type Props = { node: RaisinNode; setNode: StateUpdater<RaisinNode>; parents: WeakMap<RaisinNode, RaisinNodeWithChildren>; componentModel: ComponentModel };

export function useDND(props: Props) {
  const elementToNode = useRef(new WeakMap<HTMLElement, RaisinElementNode>()).current;
  const elementToInteract = useRef(new WeakMap<HTMLElement, Interactable>()).current;
  const [isDragActive, setIsDragActive] = useState<boolean>(false);

  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const popper = usePopper(referenceElement, popperElement, {
    placement: 'left-start',
  });

  const sharedState = {
    elementToNode,
    elementToInteract,
    props,
    setReferenceElement,
    popper,
    isDragActive,
    setIsDragActive,
    componentModel: props.componentModel,
  };
  return {
    ...useDragState(sharedState),
    ...useDropState(sharedState),
    isDragActive,
    elementToNode,
    popper,
    setPopperElement,
    setReferenceElement,
  };
}

type SharedState = {
  elementToNode: WeakMap<HTMLElement, RaisinElementNode>;
  elementToInteract: WeakMap<HTMLElement, Interactable>;
  props: Props;
  setReferenceElement: StateUpdater<HTMLElement>;
  popper: ReturnType<typeof usePopper>;

  componentModel: ComponentModel;
  isDragActive: boolean;
  setIsDragActive: StateUpdater<boolean>;
};

function useDragState(sharedState: SharedState) {
  const [dragCoords, setDragCoords] = useState<DragCoords>(undefined);

  function createDraggable(element: HTMLElement, node: RaisinElementNode) {
    const interactable = interact(element)
      .styleCursor(false)
      .draggable({
        // enable inertial throwing
        allowFrom: '[data-draggable]',
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
            event.target.style.zIndex = 'auto';

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
            // moveTargetRelative(event.target, 0, 0);
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
      // sharedState.popper.update();
    }

    return interactable;
  }

  const setDraggableRef = useDragRefs(sharedState, createDraggable);
  return { dragCoords, setDraggableRef } as const;
}

export function useDropState(sharedState: SharedState) {
  const [dropTarget, setDropTarget] = useState<DropState>(undefined);
  // const [possibleDrop, setPossibleDrop] = useState<HTMLElement>(undefined)

  function getLocation(element: HTMLElement): Location {
    const node = sharedState.elementToNode.get(element);

    const parent = sharedState.props.parents.get(node);
    return {
      modelElement: node,
      viewElement: element,
      idxInParent: parent.children.indexOf(node),
      slotInParent: (node as DOMHandler.Element).attribs?.slot,
    };
  }

  const setDroppableRef = useDragRefs(sharedState, (element, raisinNode, idx: number, slot: string) => {
    return interact(element).dropzone({
      // Require a 75% element overlap for a drop to be possible
      // overlap: 0.75,

      accept: ({ draggableElement }: { dropzone: Interactable; draggableElement: HTMLElement }) => {
        const dropped = sharedState.elementToNode.get(draggableElement);
        // const dropzoneNode = sharedState.elementToNode.get(dropzone);
        return sharedState.componentModel.isValidChild(dropped, raisinNode, slot);
      },
      ondragenter: function (event) {
        // feedback the possibility of a drop
        event.relatedTarget.style.background = 'green';
        // (event.target as HTMLElement).classList.add(ActiveDropTarget);
        // event.target.style.outline = '3px solid red';
        const dropzone = sharedState.elementToNode.get(event.target);

        const from = getLocation(event.relatedTarget);
        setDropTarget({
          from,
          to: {
            modelElement: dropzone,
            viewElement: event.target,
            idxInParent: idx,
            slotInParent: slot,
          },
        });
        sharedState.setReferenceElement(event.target);

        console.log('Possible drop', event.target);
      },
      ondragleave: function (event) {
        // remove the drop feedback style
        // 'Dragged out'
        // (event.target as HTMLElement).classList.remove(ActiveDropTarget);
        // event.target.style.background = '';
        event.relatedTarget.style.background = '';
        setDropTarget(undefined);
      },

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

        setDropTarget(undefined);
        // event.relatedTarget.style.background = 'pink';
      },

      /**
       * For dropzones only
       *
       * `dropactivate` and `dropdeactivate` when an acceptable drag starts and ends
       */
      ondropactivate: function () {
        // add active dropzone feedback
        // event.target.style.border = '1px dotted #CCC';
        sharedState.setIsDragActive(true);
      },
      ondropdeactivate: function () {
        sharedState.setIsDragActive(false);
        // event.target.style.border = '';
        // remove active dropzone feedback
      },
    });
  });

  return { setDroppableRef, dropTarget };
}

/**
 *
 * @param sharedState
 * @param builder
 */
function useDragRefs(sharedState: SharedState, builder: (element: HTMLElement, node: RaisinElementNode, ...args: unknown[]) => Interactable) {
  const setDraggableRef = (node: RaisinElementNode, element: HTMLElement, ...args: unknown[]) => {
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
