import { getPath, RaisinElementNode, RaisinNode } from '@raisins/core';
import { Slot } from '@raisins/schema/schema';
import { atom } from 'jotai';
import {
  ComponentMetaAtom,
  ComponentModelAtom,
} from '../component-metamodel/ComponentModel';
import { DuplicateNodeAtom, RemoveNodeAtom } from '../editting/EditAtoms';
import { DefaultSlotMeta } from '../model/EditorModel';
import { SelectedAtom, SelectedNodeAtom } from '../selection/SelectedAtom';
import { isElementNode, isRoot } from '../util/isNode';
import { atomForAttributes } from '../atoms/atomForAttributes';
import { atomForNode } from './node-context';
import {
  DropPloppedNodeInSlotAtom,
  PickedAtom,
  PickedNodeAtom,
} from '../atoms/pickAndPlopAtoms';
import { RootNodeAtom } from '../hooks/CoreAtoms';
import { HoveredAtom } from '../canvas/CanvasHoveredAtom';

/**
 * Is the node in context currently selected?
 */
export const isSelectedForNode = atomForNode(
  (n) => atom((get) => get(SelectedNodeAtom) === get(n)),
  'isSelectedForNode'
);

export const nodeHovered = atomForNode(
  (n) => atom((get) => get(HoveredAtom) === get(n), (get, set) => set(HoveredAtom, get(n))),
  'nodeHovered'
);

export const isNodePicked = atomForNode(
  (n) => atom((get) => get(PickedNodeAtom) === get(n)),
  'isNodePicked'
);

export const togglePickNode = atomForNode(
  (n) =>
    atom(null, (get, set) => {
      const node = get(n);
      const isNodePicked = get(PickedNodeAtom) === node;
      if (isNodePicked) {
        set(PickedAtom, undefined);
      } else {
        const currrentDoc = get(RootNodeAtom);
        set(PickedAtom, getPath(currrentDoc, node));
      }
    }),
  'togglePickNode'
);

export const canPlopHereAtom = atomForNode(
  (n) =>
    atom((get) => {
      const node = get(n);
      const pickedNode = get(PickedNodeAtom);
      if (!pickedNode || !node) return () => false;
      const { isValidChild } = get(ComponentModelAtom);
      if (!isElementNode(pickedNode)) return () => false;
      if (!isElementNode(node)) return () => false;

      const fn = ({ slot, idx }: { slot: string; idx: number }) => {
        return isValidChild(pickedNode, node, slot);
      };
      return fn;
    }),
  'canPlopHereAtom'
);

export const plopNodeHere = atomForNode(
  (n) =>
    atom(null, (get, set, { idx, slot }: { idx: number; slot: string }) => {
      const node = get(n);
      if (!isElementNode(node)) {
        // Is not an element, do nothingl
        return;
      }
      set(DropPloppedNodeInSlotAtom, { parent: node, idx, slot });
    }),
  'plopNodeHere'
);

/**
 * Selects the node in context
 */
export const setSelectedForNode = atomForNode(
  (n) =>
    atom(null, (get, set) => {
      set(SelectedAtom, get(n));
    }),
  'setSelectedForNode'
);

/**
 * Gets details on the type of node
 */
export const isNodeAnElement = atomForNode(
  (n) => atom((get) => isElementNode(get(n))),
  'isNodeAnElement'
);

/**
 * Attributes for node
 */
export const attributesForNode = atomForNode(
  atomForAttributes,
  'attributesForNode'
);

/**
 * Gets component meta for the node in context
 */
export const componentMetaForNode = atomForNode(
  (n) =>
    atom((get) => {
      const comp = get(ComponentModelAtom);
      const node = get(n);
      return comp.getComponentMeta(node as RaisinElementNode);
    }),
  'componentMetaForNode'
);

/**
 * Gets slots for the node in context
 */
export const slotsForNode = atomForNode(
  (n) =>
    atom((get) => {
      const comp = get(ComponentModelAtom);
      const node = get(n);

      // Root has just one slot
      if (isRoot(node)) return [DefaultSlotMeta] as Slot[];
      if (!isElementNode(node)) return [] as Slot[];

      const meta = comp.getComponentMeta(node);

      const definedSlots = meta?.slots?.map((s) => s.name) ?? [];

      const childSlots = node.children.map((child) => {
        const slotName = (child as RaisinElementNode)?.attribs?.slot ?? '';
        return slotName;
      });
      const allSlots = [...definedSlots, ...childSlots];
      const dedupedSet = new Set(allSlots);
      const allSlotsWithMeta = [...dedupedSet.keys()].sort().map((k) => {
        const slot: Slot = meta.slots?.find((s) => s.name === k) ?? { name: k };
        return slot;
      });
      // TODO: Filter slots so they don't show text nodes?
      // TODO: Figure out how to deal with elements that shouldn't have childen but they do?
      //    -  maybe show the children, but don't allow drop targets or "Add New"
      //    - show RED validation?
      return allSlotsWithMeta;
    }),
  'slotsForNode'
);

/**
 * Removes the node in context from the document
 */
export const removeForNode = atomForNode(
  (n) => atom(null, (get, set) => set(RemoveNodeAtom, get(n))),
  'removeForNode'
);

/**
 * Duplicates the node in context from the document
 */
export const duplicateForNode = atomForNode(
  (n) => atom(null, (get, set) => set(DuplicateNodeAtom, get(n))),
  'duplicateForNode'
);

/**
 * Gets the human readable name for the next in context
 */
export const nameForNode = atomForNode(
  (n) =>
    atom((get) => {
      const node = get(n);
      const getComponentMeta = get(ComponentMetaAtom);
      if (!isElementNode(node)) return node.type;
      const meta = getComponentMeta(node);
      return meta?.title ?? node.tagName;
    }),
  'nameForNode'
);
