import { getPath, RaisinElementNode, RaisinNode } from '@raisins/core';
import { Slot } from '@raisins/schema/schema';
import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import {
  ComponentMetaAtom,
  ComponentModelAtom,
} from '../component-metamodel/ComponentModel';
import { RootNodeAtom } from '../core/CoreAtoms';
import { DuplicateNodeAtom, RemoveNodeAtom } from '../core/editting/EditAtoms';
import {
  HoveredNodeAtom,
  HoveredSoulAtom,
} from '../core/selection/HoveredNode';
import {
  DropPloppedNodeInSlotAtom,
  PickedAtom,
  PickedNodeAtom,
} from '../core/selection/PickedNode';
import { SelectedAtom, SelectedNodeAtom } from '../core/selection/SelectedNode';
import { GetSoulAtom } from '../core/souls/Soul';
import { isElementNode } from '../util/isNode';
import { atomForAttributes } from './atoms/atomForAttributes';
import { atomForTagName } from './atoms/atomForTagName';
import { NodeScope } from './NodeScope';

export const NodeMolecule = molecule((getMol, getScope) => {
  const n = getScope(NodeScope);

  /**
   * Is the node in context currently selected?
   */
  const isSelectedForNode = atom((get) => get(SelectedNodeAtom) === get(n));

  const nodeSoul = atom((get) => {
    const node = get(n);
    const getSoul = get(GetSoulAtom);
    const soul = getSoul(node);
    return soul;
  });

  const nodeHovered = atom(
    (get) => get(HoveredNodeAtom) === get(n),
    (get, set) => {
      const node = get(n);
      const getSoul = get(GetSoulAtom);
      const soul = getSoul(node);
      set(HoveredSoulAtom, soul);
    }
  );

  const isNodePicked = atom((get) => get(PickedNodeAtom) === get(n));

  const togglePickNode = atom(null, (get, set) => {
    const node = get(n);
    const isNodePicked = get(PickedNodeAtom) === node;
    if (isNodePicked) {
      set(PickedAtom, undefined);
    } else {
      const currrentDoc = get(RootNodeAtom);
      set(PickedAtom, getPath(currrentDoc, node));
    }
  });

  const canPlopHereAtom = atom((get) => {
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
  });

  /**
   * For plopping the active picked node into his node at a given idx and slot
   */
  const plopNodeHere = atom(
    null,
    (get, set, { idx, slot }: { idx: number; slot: string }) => {
      const node = get(n);
      if (!isElementNode(node)) {
        // Is not an element, do nothingl
        return;
      }
      set(DropPloppedNodeInSlotAtom, { parent: node, idx, slot });
    }
  );

  /**
   * Selects the node in context
   */
  const setSelectedForNode = atom(null, (get, set) => {
    set(SelectedAtom, get(n));
  });
  /**
   * Gets details on the type of node
   */
  const isNodeAnElement = atom((get) => isElementNode(get(n)));

  /**
   * Attributes for node
   */
  const attributesForNode = atomForAttributes(n);

  /**
   * Gets component meta for the node in context
   */
  const componentMetaForNode = atom((get) => {
    const comp = get(ComponentModelAtom);
    const node = get(n);
    return comp.getComponentMeta((node as RaisinElementNode).tagName);
  });

  const tagNameAtom = atomForTagName(n);

  const childSlotsAtom = atom((get) => {
    // FIXME: This is updated too frequently, causing a new referentially unequal array and a rerender
    const children = [] as RaisinNode[]; //get(atomForChildren(n));
    const childSlots = children.map((child) => {
      const slotName = (child as RaisinElementNode)?.attribs?.slot ?? '';
      return slotName;
    });
    return childSlots;
  });

  /**
   * Gets slots for the node in context
   */
  const slotsForNode = atom((get) => {
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

  /**
   * Removes the node in context from the document
   */
  const removeForNode = atom(null, (get, set) => set(RemoveNodeAtom, get(n)));

  /**
   * Duplicates the node in context from the document
   */
  const duplicateForNode = atom(null, (get, set) =>
    set(DuplicateNodeAtom, get(n))
  );

  /**
   * Gets the human readable name for the next in context
   */
  const nameForNode = atom((get) => {
    const tagName = get(atomForTagName(n));
    const getComponentMeta = get(ComponentMetaAtom);
    if (!tagName) return '';
    const meta = getComponentMeta(tagName);
    return meta?.title ?? tagName;
  });

  return {
    isSelectedForNode,
    nodeSoul,
    nodeHovered,
    isNodePicked,
    togglePickNode,
    canPlopHereAtom,
    plopNodeHere,
    setSelectedForNode,
    isNodeAnElement,
    attributesForNode,
    componentMetaForNode,
    tagNameAtom,
    childSlotsAtom,
    slotsForNode,
    removeForNode,
    duplicateForNode,
    nameForNode,
  };
});
