import { NodePath, RaisinNode, RaisinNodeWithChildren } from '@raisins/core';
import { Slot } from '@raisins/schema/schema';
import { StateUpdater } from '../util/NewState';

export type CoreModel = {
  node: RaisinNode;
  slots?: NodeWithSlots;
  initial: string;

  serialized: string;
  html: string;
  setHtml: StateUpdater<string>;

  setNode: StateUpdater<RaisinNode>;

  getAncestry(node: RaisinNode): RaisinNodeWithChildren[];

  /*
   * Interactions
   */
  selected?: RaisinNode;
  setSelected(node?: RaisinNode): void;

  getId(node: RaisinNode): string;
  getPath(node: RaisinNode): NodePath;

  /*
   * Mutations
   */
  deleteSelected(): void;
  duplicateNode(node: RaisinNode): void;
  removeNode(node: RaisinNode): void;
  insert(node: RaisinNode, parent: RaisinNode, idx: number): void;
  replaceNode(prev: RaisinNode, next: RaisinNode): void;
  replacePath(prev: NodePath, next: RaisinNode): void;
};

export type Model = CoreModel;

export type NodeWithSlots = {
  node: RaisinNode;
  slots?: NamedSlot[];
};

export type NamedSlot = {
  slot: Slot;
  children?: NodeWithSlots[];
};
export const DefaultSlot: NamedSlot = {
  slot: {
    name: '',
    title: 'Content',
  },
};

export type Block = {
  name: string;
  tag: string;
};
