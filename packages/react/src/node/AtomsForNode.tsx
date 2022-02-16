import { getPath, RaisinElementNode, RaisinNode } from '@raisins/core';
import { Slot } from '@raisins/schema/schema';
import { atom } from 'jotai';
import { atomForAttributes } from '../atoms/atomForAttributes';
import {
  DropPloppedNodeInSlotAtom,
  PickedAtom,
  PickedNodeAtom,
} from '../atoms/pickAndPlopAtoms';
import { GetSoulAtom } from '../atoms/Soul';
import { HoveredAtom, HoveredSoulAtom } from '../canvas/CanvasHoveredAtom';
import {
  ComponentMetaAtom,
  ComponentModelAtom,
} from '../component-metamodel/ComponentModel';
import { DuplicateNodeAtom, RemoveNodeAtom } from '../editting/EditAtoms';
import { RootNodeAtom } from '../hooks/CoreAtoms';
import { SelectedAtom, SelectedNodeAtom } from '../selection/SelectedAtom';
import { isElementNode } from '../util/isNode';
import { atomForNode } from './node-context';
import { tagNameForNode } from './tagName';

/**
 * Is the node in context currently selected?
 */
export const isSelectedForNode = atomForNode(
  (n) => atom((get) => get(SelectedNodeAtom) === get(n)),
  'isSelectedForNode'
);

export const nodeSoul = atomForNode((n) =>
  atom((get) => {
    const node = get(n);
    const getSoul = get(GetSoulAtom);
    const soul = getSoul(node);
    return soul;
  })
);

export const nodeHovered = atomForNode(
  (n) =>
    atom(
      (get) => get(HoveredAtom) === get(n),
      (get, set) => {
        const node = get(n);
        const getSoul = get(GetSoulAtom);
        const soul = getSoul(node);
        set(HoveredSoulAtom, soul);
      }
    ),
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
      return comp.getComponentMeta((node as RaisinElementNode).tagName);
    }),
  'componentMetaForNode'
);

/**
 * Gets slots for the node in context
 */
export const slotsForNode = atomForNode((n) => {
  const tagNameAtom = tagNameForNode(n);
  const childSlotsAtom = atom((get) => {
    // FIXME: This is updated too frequently, causing a new referentially unequal array and a rerender
    const children = [] as RaisinNode[]; //get(atomForChildren(n));
    const childSlots = children.map((child) => {
      const slotName = (child as RaisinElementNode)?.attribs?.slot ?? '';
      return slotName;
    });
    return childSlots;
  });

  return atom((get) => {
    const comp = get(ComponentModelAtom);
    const tagName = get(tagNameAtom);
    // Root has just one slot
    if (!tagName) return [] as Slot[];
    const meta = comp.getComponentMeta(tagName);

    const childSlots = get(childSlotsAtom);

    const definedSlots = meta?.slots?.map((s) => s.name) ?? [];

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
  });
}, 'slotsForNode');

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
      const tagName = get(tagNameForNode(n));
      const getComponentMeta = get(ComponentMetaAtom);
      if (!tagName) return '';
      const meta = getComponentMeta(tagName);
      return meta?.title ?? tagName;
    }),
  'nameForNode'
);
