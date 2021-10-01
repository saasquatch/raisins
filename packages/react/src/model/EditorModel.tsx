import { RaisinNode, RaisinNodeWithChildren } from '@raisins/core';
import { Slot } from '@raisins/schema/schema';
import useCanvas, { Mode } from '../hooks/useCanvas';
import { ComponentModel } from '../hooks/useComponentModel';
import { useStyleEditor } from '../hooks/useStyleEditor';
import { StateUpdater } from '../util/NewState';

export type CoreModel = {
  node: RaisinNode;
  slots?: NodeWithSlots;
  initial: string;

  serialized: string;
  html: string;
  setHtml: StateUpdater<string>;

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
  deleteSelected(): void;
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
  slot: Slot;
  children?: NodeWithSlots[];
};
export const DefaultSlot:NamedSlot = {
  slot: {
    name: "",
    title: "Content"
  }
};

export type Block = {
  name: string;
  tag: string;
};
