import { useComponentModel } from '../components/raisin-editor/useComponentModel';
import { useInlinedHTML } from '../components/raisin-editor/useInlinedHTML';
import { DragCoords } from './DragCoords';
import { DropState } from './DropState';
import { RaisinNode, RaisinNodeWithChildren } from './RaisinNode';

export type Model = {
  node: RaisinNode;
  parents: WeakMap<RaisinNode, RaisinNodeWithChildren>;
  slots: NodeWithSlots;
  initial: string;

  getId(node: RaisinNode): string;

  /*
   * Interactions
   */
  selected?: RaisinNode;
  setSelected(node: RaisinNode): void;

  /*
   * Mutations
   */
  duplicateNode(node: RaisinNode): void;
  removeNode(node: RaisinNode): void;
  moveUp(node: RaisinNode): void;
  moveDown(node: RaisinNode): void;
  replaceNode(prev: RaisinNode, next: RaisinNode): void;

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
  setDraggableRef(node: RaisinNode, element: HTMLElement): void;
  setDroppableRef(node: RaisinNode, element: HTMLElement, idx: number, slot: string): void;
  dragCoords: DragCoords;
  dropTarget?: DropState;
  isDragActive: boolean;
  elementToNode: WeakMap<HTMLElement, RaisinNode>;
} & ReturnType<typeof useInlinedHTML> &
  ReturnType<typeof useComponentModel>;

export type NodeWithSlots = {
  node: RaisinNode;
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
