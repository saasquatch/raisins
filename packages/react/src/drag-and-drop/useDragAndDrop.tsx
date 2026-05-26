import React, { useCallback, useMemo } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useMolecule } from 'bunshi/react';
import { RaisinNodeWithChildren } from '@raisins/core';
import { Block } from '../component-metamodel/ComponentModel';
import { DragAndDropMolecule } from '../core/selection/DragAndDropMolecule';
import { PickAndPlopMolecule } from '../core/selection/PickAndPlopMolecule';
import { NodeMolecule } from '../node/NodeMolecule';

/**
 * Hook for making a sidebar block draggable via the HTML Drag and Drop API.
 * Returns props to spread onto a draggable element.
 *
 * When a drag starts, this also sets the PickedAtom from PickAndPlopMolecule
 * so that existing canPlopHereAtom validation works seamlessly with drag targets.
 */
export function useDragBlock(block: Block) {
  const {
    DraggedAtom,
    DraggingIsActive,
    LastHoveredPlopAtom,
    TryCommitLastHoveredAtom,
  } = useMolecule(DragAndDropMolecule);
  const { PickedAtom } = useMolecule(PickAndPlopMolecule);
  const [dragged, setDragged] = useAtom(DraggedAtom);
  const setPicked = useSetAtom(PickedAtom);
  const setLastHovered = useSetAtom(LastHoveredPlopAtom);
  const tryCommit = useSetAtom(TryCommitLastHoveredAtom);
  const isDragging = useAtomValue(DraggingIsActive);

  const isThisBlockDragged =
    dragged?.type === 'block' && dragged.block === block;

  const onDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', block.title);
      setDragged({ type: 'block', block });
      // Also set PickedAtom so canPlopHereAtom validation works
      setPicked({ type: 'block', block });
    },
    [block, setDragged, setPicked]
  );

  const onDragEnd = useCallback(() => {
    // The native HTML5 `drop` event does not reliably fire when the cursor
    // is over a cross-origin sandboxed iframe (the canvas). However
    // `dragenter`/`dragleave` *do* fire and update LastHoveredPlopAtom
    // through the canvas drag plugin. Use that as a fallback drop target.
    // For synchronous in-page drops (e.g. the layers panel) this is a no-op
    // because DropNodeInSlotAtom already cleared DraggedAtom.
    tryCommit();
    setDragged(undefined);
    setPicked(undefined);
    setLastHovered(undefined);
  }, [tryCommit, setDragged, setPicked, setLastHovered]);

  return {
    draggable: true,
    onDragStart,
    onDragEnd,
    isDragging: isThisBlockDragged,
    anyDragging: isDragging,
  };
}

/**
 * Hook for making an existing element layer draggable (for move operations).
 * Also sets PickedNodeAtom so that plop target validation works.
 */
export function useDragNode() {
  const {
    DraggedAtom,
    DraggingIsActive,
    DraggedNodeAtom,
    LastHoveredPlopAtom,
    TryCommitLastHoveredAtom,
  } = useMolecule(DragAndDropMolecule);
  const { PickedAtom, PickedNodeAtom } = useMolecule(PickAndPlopMolecule);
  const { nodeAtom } = useMolecule(NodeMolecule);
  const node = useAtomValue(nodeAtom);
  const setDraggedNode = useSetAtom(DraggedNodeAtom);
  const setDragged = useSetAtom(DraggedAtom);
  const setPicked = useSetAtom(PickedAtom);
  const setPickedNode = useSetAtom(PickedNodeAtom);
  const setLastHovered = useSetAtom(LastHoveredPlopAtom);
  const tryCommit = useSetAtom(TryCommitLastHoveredAtom);
  const isDragging = useAtomValue(DraggingIsActive);
  const draggedNode = useAtomValue(DraggedNodeAtom);

  const isThisNodeDragged = draggedNode === node;

  const onDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'node');
      setDraggedNode(node);
      // Also set PickedNodeAtom so canPlopHereAtom validation works
      setPickedNode(node);
    },
    [node, setDraggedNode, setPickedNode]
  );

  const onDragEnd = useCallback(() => {
    // See note in useDragBlock.onDragEnd above.
    tryCommit();
    setDragged(undefined);
    setPicked(undefined);
    setLastHovered(undefined);
  }, [tryCommit, setDragged, setPicked, setLastHovered]);

  return {
    draggable: true,
    onDragStart,
    onDragEnd,
    isDragging: isThisNodeDragged,
    anyDragging: isDragging,
  };
}

export type DropTargetProps = {
  idx: number;
  slot: string;
};

/**
 * Hook for making a plop target accept drops via the HTML Drag and Drop API.
 * Uses canPlopHereAtom from NodeMolecule (which reads from PickAndPlopMolecule's PickedNodeAtom)
 * to determine if a drop is valid. When a valid drop occurs, it invokes the
 * DragAndDropMolecule's DropNodeInSlotAtom and clears PickedAtom.
 */
export function useDropTarget({ idx, slot }: DropTargetProps) {
  const { DraggingIsActive, DropNodeInSlotAtom, LastHoveredPlopAtom } =
    useMolecule(DragAndDropMolecule);
  const { PickedAtom } = useMolecule(PickAndPlopMolecule);
  const { canPlopHereAtom, nodeAtom } = useMolecule(NodeMolecule);

  const isDragging = useAtomValue(DraggingIsActive);
  const canPlop = useAtomValue(canPlopHereAtom);
  const node = useAtomValue(nodeAtom);
  const dropNode = useSetAtom(DropNodeInSlotAtom);
  const setPicked = useSetAtom(PickedAtom);
  const setLastHovered = useSetAtom(LastHoveredPlopAtom);

  const [isOver, setIsOver] = React.useState(false);

  const isDroppable = useMemo(
    () => canPlop({ slot, idx }),
    [canPlop, slot, idx]
  );

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!isDroppable) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setIsOver(true);
    },
    [isDroppable]
  );

  const onDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (!isDroppable) return;
      e.preventDefault();
      setIsOver(true);
      setLastHovered({
        parent: node as RaisinNodeWithChildren,
        idx,
        slot,
      });
    },
    [isDroppable, setLastHovered, node, idx, slot]
  );

  const onDragLeave = useCallback(() => {
    setIsOver(false);
    setLastHovered(undefined);
  }, [setLastHovered]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsOver(false);
      if (!isDroppable) return;
      dropNode({ parent: node as RaisinNodeWithChildren, idx, slot });
      // Clear pick state as well
      setPicked(undefined);
    },
    [isDroppable, dropNode, node, idx, slot, setPicked]
  );

  return {
    isDroppable: isDragging && isDroppable,
    isOver,
    dropTargetProps: {
      onDragOver,
      onDragEnter,
      onDragLeave,
      onDrop,
    },
  };
}
