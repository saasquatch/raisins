import useCanvas from '../hooks/useCanvas';
import { ComponentModel } from '../hooks/useComponentModel';
import { Mode } from '../hooks/useEditor';
import { useStyleEditor } from '../hooks/useStyleEditor';
import { DragCoords } from './DragCoords';
import { DropState } from './DropState';
import { RaisinNode, RaisinNodeWithChildren } from '../../../core/src/html-dom/RaisinNode';
import { StateUpdater } from '../util/NewState';

export type CoreModel = {
  node: RaisinNode;
  serialized: string;
  slots?: NodeWithSlots;
  initial: string;

  setNode: StateUpdater<RaisinNode>;

  parents: WeakMap<RaisinNode, RaisinNodeWithChildren>;
  getAncestry(node: RaisinNode): RaisinNodeWithChildren[];

  /*
   * Interactions
   */
  selected?: RaisinNode;
  setSelected(node?: RaisinNode): void;
  selectParent(): void;

  getId(node: RaisinNode): string;
  setSelectedId(id: string): void;

  /*
   * Mutations
   */
  duplicateNode(node: RaisinNode): void;
  removeNode(node: RaisinNode): void;
  insert(node: RaisinNode, parent: RaisinNode, idx: number): void;
  moveUp(node: RaisinNode): void;
  moveDown(node: RaisinNode): void;
  replaceNode(prev: RaisinNode, next: RaisinNode): void;
};

export type HistoryModel = {
  /*
   * History management
   */
  undo(): void;
  redo(): void;
  hasUndo: boolean;
  hasRedo: boolean;
};

export type Model = CoreModel &
  HistoryModel & {

    /**
     * Canvas
     */
    mode: Mode;
    setMode: StateUpdater<Mode>;
  } & ComponentModel &
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
