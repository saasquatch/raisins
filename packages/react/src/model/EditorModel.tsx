import { NodePath, RaisinNode, RaisinNodeWithChildren } from '@raisins/core';
import { Slot } from '@raisins/schema/schema';

export type IdentifierModel = {
  getAncestry(node: RaisinNode): RaisinNodeWithChildren[];
  getId(node: RaisinNode): string;
  getPath(node: RaisinNode): NodePath;
};

export type NodeWithSlots = {
  node: RaisinNode;
  slots?: NamedSlot[];
};

export type NamedSlot = {
  slot: Slot;
  children?: NodeWithSlots[];
};

export const DefaultSlotMeta: Slot = {
  name: '',
  title: 'Content',
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
