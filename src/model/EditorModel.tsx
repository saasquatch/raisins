import useCanvas from '../hooks/useCanvas';
import { ComponentModel } from '../hooks/useComponentModel';
import { useDND } from '../hooks/useDragState';
import { Mode } from '../hooks/useEditor';
import { useStyleEditor } from '../hooks/useStyleEditor';
import { DragCoords } from './DragCoords';
import { DropState } from './DropState';
import { RaisinNode, RaisinNodeWithChildren } from '../html-dom/RaisinNode';

export type Model = {
  node: RaisinNode;
  slots: NodeWithSlots;
  initial: string;

  parents: WeakMap<RaisinNode, RaisinNodeWithChildren>;
  getAncestry(node: RaisinNode): RaisinNodeWithChildren[];

  getId(node: RaisinNode): string;

  /*
   * Interactions
   */
  selected?: RaisinNode;
  setSelected(node: RaisinNode): void;
  selectParent(): void;

  /*
   * Mutations
   */
  duplicateNode(node: RaisinNode): void;
  removeNode(node: RaisinNode): void;
  insert(node: RaisinNode, parent: RaisinNode, idx: number): void;
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

  /**
   * Canvas
   */
  mode: Mode;
  setMode: StateUpdater<Mode>;
  /*
   * Drag and drop
   */
  setDraggableRef(node: RaisinNode, element: HTMLElement): void;
  setDroppableRef(node: RaisinNode, element: HTMLElement, idx: number, slot: string): void;
  dragCoords: DragCoords;
  dropTarget?: DropState;
  isDragActive: boolean;
  elementToNode: WeakMap<HTMLElement, RaisinNode>;
} & ComponentModel &
  ReturnType<typeof useDND> &
  ReturnType<typeof useCanvas> &
  ReturnType<typeof useStyleEditor>;

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
