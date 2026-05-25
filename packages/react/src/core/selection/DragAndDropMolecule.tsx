import { RaisinElementNode } from '@raisins/core';
import {
  getNode,
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
import { waitForUpdate } from '../../util/waitForUpdate';
import { CoreMolecule } from '../CoreAtoms';
import { SelectedNodeMolecule } from './SelectedNodeMolecule';

const { moveNode, insertAtPath, clone } = htmlUtil;

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

      return getNode(currentDoc, dragged.path);
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
   * Drop the dragged node into a specific slot at a given index
   */
  const DropNodeInSlotAtom = atom(
    null,
    async (get, set, { parent, idx, slot }: DragPlopDestination) => {
      const dragged = get(DraggedAtom);
      if (!dragged) return;

      const currentDoc = get(RootNodeAtom);
      const parentPath = getPath(currentDoc, parent)!;

      if (dragged.type === 'block') {
        dragged.block.content.attribs.slot = slot;
        const cloneOfDraggedNode = clone(
          dragged.block.content
        ) as RaisinElementNode;

        const newDocument = insertAtPath(
          currentDoc,
          cloneOfDraggedNode,
          parentPath,
          idx
        );
        set(RootNodeAtom, newDocument);
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

        set(RootNodeAtom, newDocument);
      }
      // Clear drag state after drop
      set(DraggedAtom, undefined);
    }
  );

  return {
    DraggedAtom,
    DraggedNodeAtom,
    DraggingIsActive,
    DropNodeInSlotAtom,
  };
});
