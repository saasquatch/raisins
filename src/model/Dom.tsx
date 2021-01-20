import * as DOMHandler from 'domhandler';
import { DragCoords } from './DragCoords';
import { DropState } from './DropState';

export type Model = {
  node: DOMHandler.Node;
  slots: NodeWithSlots;
  initial: string;

  getId(node: DOMHandler.Node): string;

  /*
   * Interactions
   */
  selected?: DOMHandler.Node;
  setSelected(node: DOMHandler.Node): void;

  /*
   * Mutations
   */
  setState: StateUpdater<DOMHandler.Node>;
  duplicateNode(node: DOMHandler.Node): void;
  removeNode(node: DOMHandler.Node): void;
  moveUp(node: DOMHandler.Node): void;
  moveDown(node: DOMHandler.Node): void;
  replaceNode(prev: DOMHandler.Node, next: DOMHandler.Node): void;

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
  setDroppableRef(node: DOMHandler.Node, element: HTMLElement): void;
  dragCoords: DragCoords;
  dropTarget?: DropState;
  elementToNode: WeakMap<HTMLElement, DOMHandler.Node>;
};

export type NodeWithSlots = {
  node: DOMHandler.Node;
  slots?: NamedSlot[];
};

export type NamedSlot = {
  key: string;
  name: string;
  children?: NodeWithSlots[];
};
export const DefaultSlot = {
  key: '',
  name: 'Default Slot',
};

export type Block = {
  name: string;
  tag: string;
};

export type NewState<T> = T | ((previousState?: T) => T);
export type StateUpdater<T> = (value: NewState<T>) => void;
