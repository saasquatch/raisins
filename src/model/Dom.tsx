import * as DOMHandler from 'domhandler';
import { DragCoords } from '../components/raisin-editor/DragCoords';

export type Model = {
  node: DOMHandler.Node;

  /*
   * Interactions
   */
  selected?: DOMHandler.Node;
  setSelected(node: DOMHandler.Node): void;

  /*
   * Mutations
   */
  setState(node: DOMHandler.Node): void;
  removeNode(node: DOMHandler.Node): void;

  /*
   * History management
   */
  undo(): void;
  redo(): void;
  hasUndo: boolean;
  hasRedo: boolean;

  /*
   * Drag and drop
   */
  setDraggableRef(node: DOMHandler.Node, element: HTMLElement): void;
  dragCoords: DragCoords
};

export type Block = {
  name: string;
  tag: string;
};
