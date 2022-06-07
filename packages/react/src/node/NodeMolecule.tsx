import { getSubErrors, RaisinElementNode } from '@raisins/core';
import { Slot } from '@raisins/schema/schema';
import { atom, PrimitiveAtom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { SelectionBookmark } from 'prosemirror-state';
import { ComponentModelMolecule } from '../component-metamodel/ComponentModel';
import { CoreMolecule } from '../core/CoreAtoms';
import { EditMolecule } from '../core/editting/EditAtoms';
import { HoveredNodeMolecule } from '../core/selection/HoveredNodeMolecule';
import { PickAndPlopMolecule } from '../core/selection/PickAndPlopMolecule';
import { SelectedNodeMolecule } from '../core/selection/SelectedNodeMolecule';
import { SoulsMolecule } from '../core/souls/Soul';
import { atomWithShallowCheck } from '../util/atoms/atomWithShallowCheck';
import { isElementNode } from '../util/isNode';
import { waitForUpdate } from '../util/waitForUpdate';
import { ValidationMolecule } from '../validation/ValidationMolecule';
import { atomForAttributes } from './atoms/atomForAttributes';
import { atomForChildren } from './atoms/atomForChildren';
import { atomForTagName } from './atoms/atomForTagName';
import { NodeScopeMolecule } from './NodeScope';

/**
 *  Scoped based on the {@link NodeScopeMolecule}, defaulting to the root molecule.
 *
 * Returns useful atoms for querying or modifying a node
 */
export const NodeMolecule = molecule((getMol, getScope) => {
  const n = getMol(NodeScopeMolecule);

  const {
    PickedAtom,
    PickedNodeAtom,
    PlopNodeInSlotAtom: DropPloppedNodeInSlotAtom,
  } = getMol(PickAndPlopMolecule);
  const { HoveredNodeAtom, HoveredSoulAtom } = getMol(HoveredNodeMolecule);
  const { SelectedAtom, SelectedNodeAtom, SelectedBookmark } = getMol(
    SelectedNodeMolecule
  );
  const { DuplicateNodeAtom, RemoveNodeAtom } = getMol(EditMolecule);
  const { ComponentMetaAtom, ComponentModelAtom } = getMol(
    ComponentModelMolecule
  );
  const { JsonPointersAtom, rerenderNodeAtom } = getMol(CoreMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);

  const ValidationAtoms = getMol(ValidationMolecule);

  const jsonPointerAtom = atom((get) => {
    const node = get(n);
    const map = get(JsonPointersAtom);
    return map.get(node)!;
  });
  const errorsAtom = atom((get) => {
    const jsonPointer = get(jsonPointerAtom);
    const errors = get(ValidationAtoms.errorsAtom);
    return getSubErrors(errors, jsonPointer);
  });
  const childrenErrorsAtom = atom((get) => {
    const jsonPointer = get(jsonPointerAtom);
    const errors = get(ValidationAtoms.errorsAtom);
    return getSubErrors(errors, jsonPointer + '/children');
  });
  const attributeErrorsAtom = atom((get) => {
    const jsonPointer = get(jsonPointerAtom);
    const errors = get(ValidationAtoms.errorsAtom);
    return getSubErrors(errors, jsonPointer + '/attribs');
  });

  const hasErrors = atom((get) => get(errorsAtom).length > 0);

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
      set(PickedNodeAtom, node);
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
    const tagName = get(tagNameAtom);
    if (!tagName) return undefined;
    return comp.getComponentMeta(tagName);
  });

  const tagNameAtom = atomForTagName(n);

  const childSlotsAtom = atom((get) => {
    // FIXME: This is updated too frequently, causing a new referentially unequal array and a rerender
    // return focusAtom(n, (o) => optic_().path('children.attribs.slot'));
    const children = get(atomForChildren(n));

    const childSlots = children.map((child) => {
      const slotName = (child as RaisinElementNode)?.attribs?.slot ?? '';
      return slotName;
    });
    return childSlots;
  });

  const allSlotsForNode = atom((get) => {
    const meta = get(componentMetaForNode);
    const childSlots = get(childSlotsAtom);

    const definedSlots = meta?.slots?.map((s) => s.name) ?? [];

    const allSlots = [...definedSlots, ...childSlots];
    const dedupedSet = Array.from(new Set<string>(allSlots));
    return [...dedupedSet].sort();
  });

  /**
   * Gets slots for the node in context
   */
  const slotsForNode = atom((get) => {
    const meta = get(componentMetaForNode);
    const allSlots = get(allSlotsForNode);
    const allSlotsWithMeta = allSlots.map((k) => {
      const slot: Slot = meta?.slots?.find((s) => s.name === k) ?? { name: k };
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
  const duplicateForNode = atom(null, async (get, set) => {
    // Set render mode to prevent errors when duplicating elements with canvasRenderer = "always-replace"
    set(rerenderNodeAtom, true);
    set(DuplicateNodeAtom, get(n));
    await waitForUpdate();
    set(rerenderNodeAtom, false);
  });

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

  const bookmarkForNode: PrimitiveAtom<SelectionBookmark | undefined> = atom(
    (get) => get(SelectedBookmark),
    (get, set, next) => {
      set(SelectedNodeAtom, get(n));
      set(SelectedBookmark, next);
    }
  );

  return {
    /*
    Identifiers
    */
    nodeSoul,
    jsonPointerAtom,

    /*
    Values
    */
    nodeAtom: n,
    attributesForNode,
    isNodeAnElement,
    removeForNode,
    duplicateForNode,
    /*
    Meta
    */
    nameForNode,
    componentMetaForNode,
    tagNameAtom,

    /*
    Selection
    */
    isSelectedForNode,
    setSelectedForNode,
    bookmarkForNode,
    /*
    Hover
    */
    nodeHovered,
    /*
    Pick and plop
    */
    isNodePicked,
    togglePickNode,
    canPlopHereAtom,
    plopNodeHere,

    /*
     Slots
     */
    allSlotsForNode: atomWithShallowCheck(allSlotsForNode),
    childSlotsAtom,
    slotsForNode,
    /*
    Validation
    */
    // Shallow equal check avoids empty error case
    errorsAtom: atomWithShallowCheck(errorsAtom),
    childrenErrorsAtom: atomWithShallowCheck(childrenErrorsAtom),
    attributeErrorsAtom: atomWithShallowCheck(attributeErrorsAtom),
    hasErrorsAtom: hasErrors,
  };
});
