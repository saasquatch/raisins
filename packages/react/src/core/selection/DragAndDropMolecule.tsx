import { RaisinElementNode } from '@raisins/core';
import {
  getPath,
  htmlUtil,
  NodePath,
  RaisinNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { atom, PrimitiveAtom } from 'jotai';
import { molecule } from 'bunshi/react';
import { Block } from '../../component-metamodel/ComponentModel';
import { isFunction } from '../../util/isFunction';
import { tryGetNode } from '../../util/tryGetNode';
import { waitForUpdate } from '../../util/waitForUpdate';
import { CoreMolecule } from '../CoreAtoms';
import { SelectedNodeMolecule } from './SelectedNodeMolecule';

const { moveNode, insertAtPath, clone } = htmlUtil;

/**
 * Finds the node in `root` whose `children` array is the exact same instance as
 * `childrenRef`. Used to locate a node after a `moveNode` shallow-clone, which
 * preserves the moved node's `children` array by reference even though the node
 * object itself is a fresh clone.
 */
function findNodeByChildrenRef(
  root: RaisinNode,
  childrenRef: RaisinNode[] | undefined
): RaisinNode | undefined {
  if (!childrenRef) return undefined;
  const children = (root as RaisinNodeWithChildren).children;
  if (children === undefined) return undefined;
  if (children === childrenRef) return root;
  for (const child of children) {
    const found = findNodeByChildrenRef(child, childrenRef);
    if (found) return found;
  }
  return undefined;
}

export type DragPlopDestination = {
  parent: RaisinNodeWithChildren;
  idx: number;
  slot: string;
};

export type DraggedOption =
  | { type: 'element'; path: NodePath }
  | { type: 'block'; block: Block }
  | undefined;

/**
 * DragAndDropMolecule - provides drag-and-drop state management that closely mirrors
 * the existing PickAndPlopMolecule but uses the HTML Drag and Drop API instead of
 * click-based pick/plop interactions.
 */
export const DragAndDropMolecule = molecule(getMol => {
  const { RootNodeAtom } = getMol(CoreMolecule);
  const { SelectedAtom } = getMol(SelectedNodeMolecule);

  /**
   * Tracks the currently dragged item. Can only drag one item at a time.
   */
  const DraggedAtom = atom<DraggedOption>(undefined);

  const DraggedNodeAtom: PrimitiveAtom<RaisinNode | undefined> = atom(
    get => {
      const currentDoc = get(RootNodeAtom);
      const dragged = get(DraggedAtom);
      if (!dragged) return undefined;
      if (dragged.type !== 'element') return undefined;

      // Dangling path (doc changed since drag start) resolves to undefined.
      return tryGetNode(currentDoc, dragged.path);
    },
    (get, set, next) => {
      const node = isFunction(next)
        ? (next as Function)(get(DraggedNodeAtom))
        : next;

      if (!node) {
        set(DraggedAtom, undefined);
        return;
      }
      const currentDoc = get(RootNodeAtom);
      const path = getPath(currentDoc, node);
      if (!path) {
        set(DraggedAtom, undefined);
      } else {
        set(DraggedAtom, {
          type: 'element',
          path,
        });
      }
    }
  );

  /**
   * Whether a drag operation is currently active
   */
  const DraggingIsActive = atom(
    get => (get(DraggedAtom) !== undefined) as boolean
  );

  /**
   * Content being dragged (block content for adds, resolved node for moves).
   * The drag half of the plop candidate; plop validation reads dragged ?? picked.
   */
  const DraggedContentAtom = atom<RaisinElementNode | undefined>(get => {
    const dragged = get(DraggedAtom);
    if (!dragged) return undefined;
    if (dragged.type === 'block') return dragged.block.content;
    return get(DraggedNodeAtom) as RaisinElementNode | undefined;
  });

  /**
   * The most-recently-hovered plop target, regardless of which surface
   * (layer panel or canvas) reported the hover. Used as a fallback drop
   * destination when the platform's native `drop` event cannot reliably
   * fire — most notably when dragging into a cross-origin sandboxed iframe.
   *
   * Set on `dragenter` and cleared on `dragleave` by drop-target consumers.
   * Cleared automatically when the drag ends or commits.
   */
  const LastHoveredPlopAtom = atom<DragPlopDestination | undefined>(undefined);

  /**
   * Drop the dragged node into a specific slot at a given index
   */
  const DropNodeInSlotAtom = atom(
    null,
    async (get, set, { parent, idx, slot }: DragPlopDestination) => {
      const dragged = get(DraggedAtom);
      if (!dragged) return;

      const currentDoc = get(RootNodeAtom);
      // Destination gone from the doc — abandon rather than crash downstream.
      const parentPath = getPath(currentDoc, parent);
      if (!parentPath) {
        set(DraggedAtom, undefined);
        set(LastHoveredPlopAtom, undefined);
        return;
      }

      // Clear drag state before committing: DraggedAtom's path is valid only
      // for currentDoc, so subscribers must never see new-doc + old-path.
      const commit = (newDocument: RaisinNode) => {
        set(DraggedAtom, undefined);
        set(LastHoveredPlopAtom, undefined);
        set(RootNodeAtom, newDocument);
      };

      if (dragged.type === 'block') {
        // Clone before setting slot — block content is shared metamodel config.
        const cloneOfDraggedNode = clone(
          dragged.block.content
        ) as RaisinElementNode;
        cloneOfDraggedNode.attribs.slot = slot;

        const newDocument = insertAtPath(
          currentDoc,
          cloneOfDraggedNode,
          parentPath,
          idx
        );
        commit(newDocument);
        await waitForUpdate();
        set(SelectedAtom, cloneOfDraggedNode);
      } else {
        const draggedNode = get(DraggedNodeAtom) as RaisinElementNode;

        if (!draggedNode) {
          return;
        }
        const newDocument = moveNode(
          currentDoc,
          draggedNode,
          slot,
          parentPath,
          idx
        );

        // `moveNode` shallow-clones the dragged node to apply the new slot, so
        // `draggedNode` is no longer present in `newDocument` by reference and
        // can't be used for selection. The clone keeps the *same* `children`
        // array instance though, so we can locate the moved node by that
        // identity and select it once the new document is committed.
        const movedNode = findNodeByChildrenRef(
          newDocument,
          draggedNode.children
        );

        commit(newDocument);
        await waitForUpdate();
        // Select the node that was just moved so it shows in the edit sidebar.
        if (movedNode) {
          set(SelectedAtom, movedNode);
        }
      }
    }
  );

  /**
   * Attempts to commit a drop using {@link LastHoveredPlopAtom}.
   *
   * Called by drag sources from their `onDragEnd` handler as a fallback for
   * when a synchronous `drop` event never arrived (e.g. cross-origin iframe).
   * Safe to call after a drop already committed — `DropNodeInSlotAtom` is a
   * no-op when `DraggedAtom` has already been cleared.
   */
  const TryCommitLastHoveredAtom = atom(null, (get, set) => {
    const dragged = get(DraggedAtom);
    if (!dragged) return;
    const target = get(LastHoveredPlopAtom);
    if (!target) return;
    set(DropNodeInSlotAtom, target);
  });

  return {
    DraggedAtom,
    DraggedContentAtom,
    DraggedNodeAtom,
    DraggingIsActive,
    DropNodeInSlotAtom,
    LastHoveredPlopAtom,
    TryCommitLastHoveredAtom,
  };
});
