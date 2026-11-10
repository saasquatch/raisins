import type { Slot } from "@raisins/schema/schema.js";
import type { RaisinNode } from "../html-dom/RaisinNode.ts";

export type NodeWithSlots = {
  node: RaisinNode;
  slots?: NamedSlot[];
};

export type NamedSlot = {
  slot: Slot;
  children?: NodeWithSlots[];
};

export const DefaultSlotMeta: Slot = {
  name: "",
  title: "Content",
};

export const DefaultSlot: NamedSlot = {
  slot: {
    name: "",
    title: "Content",
  },
};

export type Block = {
  name: string;
  tag: string;
};
