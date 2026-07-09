import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useMolecule } from 'bunshi/react';
import { RaisinNode, RaisinNodeWithChildren } from '@raisins/core';
import { Block } from '../component-metamodel/ComponentModel';
import { DragAndDropMolecule } from '../core/selection/DragAndDropMolecule';
import { SelectedNodeMolecule } from '../core/selection/SelectedNodeMolecule';
import { NodeMolecule } from '../node/NodeMolecule';

/**
 * Sizing for the drag ghost (the "drag image" that follows the cursor).
 * Values are clamped to sane bounds so a full-width section doesn't produce
 * an unwieldy ghost.
 */
export type DragGhostOptions = {
  /** Desired ghost width in px, e.g. the dragged element's rect width. */
  width?: number;
  /** Desired ghost height in px, e.g. the dragged element's rect height. */
  height?: number;
  /** Cursor anchor inside the ghost. Defaults to 12. */
  offsetX?: number;
  /** Cursor anchor inside the ghost. Defaults to 12. */
  offsetY?: number;
};

export type UseDragOptions = {
  /** Replace the default drag image (a snapshot of the source) with a
   * translucent box. Use when the source is a small handle, not the element. */
  ghost?: DragGhostOptions;
};

const GHOST_MIN_WIDTH = 48;
const GHOST_MAX_WIDTH = 360;
const GHOST_MIN_HEIGHT = 32;
const GHOST_MAX_HEIGHT = 280;
const GHOST_DEFAULT_WIDTH = 120;
const GHOST_DEFAULT_HEIGHT = 80;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * Owns the drag-image element's lifecycle: created on drag start, removed on
 * drag end AND on unmount (the source can unmount mid-drag, so `dragend` may
 * never fire and the ghost would leak into `document.body`).
 */
function useDragGhost(options?: DragGhostOptions) {
  const enabled = options !== undefined;
  const { width, height, offsetX = 12, offsetY = 12 } = options ?? {};
  const ghostRef = useRef<HTMLDivElement | null>(null);

  const removeGhost = useCallback(() => {
    ghostRef.current?.remove();
    ghostRef.current = null;
  }, []);

  useEffect(() => removeGhost, [removeGhost]);

  const applyGhost = useCallback(
    (e: React.DragEvent) => {
      if (!enabled) return;
      const w = clamp(
        Math.round(width ?? GHOST_DEFAULT_WIDTH),
        GHOST_MIN_WIDTH,
        GHOST_MAX_WIDTH
      );
      const h = clamp(
        Math.round(height ?? GHOST_DEFAULT_HEIGHT),
        GHOST_MIN_HEIGHT,
        GHOST_MAX_HEIGHT
      );

      const ghost = document.createElement('div');
      ghost.style.cssText = [
        'position: absolute',
        // Off-screen; the browser captures the bitmap synchronously.
        'top: -1000px',
        'left: -1000px',
        `width: ${w}px`,
        `height: ${h}px`,
        'box-sizing: border-box',
        'border: 1px solid #c5c5c5',
        'border-radius: 4px',
        'background: rgba(255, 255, 255, 0.85)',
        'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15)',
        'pointer-events: none',
      ].join(';');
      document.body.appendChild(ghost);
      ghostRef.current = ghost;

      e.dataTransfer.setDragImage(ghost, offsetX, offsetY);
    },
    [enabled, width, height, offsetX, offsetY]
  );

  return { applyGhost, removeGhost };
}

/**
 * Makes a sidebar block draggable via the HTML Drag and Drop API. Returns
 * props to spread onto a draggable element. Plop validation reads the dragged
 * state directly, so this does not touch pick state.
 */
export function useDragBlock(block: Block, options?: UseDragOptions) {
  const {
    DraggedAtom,
    DraggingIsActive,
    LastHoveredPlopAtom,
    TryCommitLastHoveredAtom,
  } = useMolecule(DragAndDropMolecule);
  const [dragged, setDragged] = useAtom(DraggedAtom);
  const setLastHovered = useSetAtom(LastHoveredPlopAtom);
  const tryCommit = useSetAtom(TryCommitLastHoveredAtom);
  const isDragging = useAtomValue(DraggingIsActive);
  const { applyGhost, removeGhost } = useDragGhost(options?.ghost);

  const isThisBlockDragged =
    dragged?.type === 'block' && dragged.block === block;

  const onDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', block.title);
      applyGhost(e);
      setDragged({ type: 'block', block });
    },
    [block, setDragged, applyGhost]
  );

  const onDragEnd = useCallback(() => {
    removeGhost();
    // Fallback drop: native `drop` doesn't fire over the sandboxed canvas
    // iframe, so commit the last hovered target. No-op for in-page drops.
    tryCommit();
    setDragged(undefined);
    setLastHovered(undefined);
  }, [tryCommit, setDragged, setLastHovered, removeGhost]);

  return {
    draggable: true,
    onDragStart,
    onDragEnd,
    isDragging: isThisBlockDragged,
    anyDragging: isDragging,
  };
}

/**
 * Shared move-drag implementation. The caller supplies the `node` so this works
 * both inside a node's scope and from an overlay (e.g. a canvas toolbar) that
 * lives outside any {@link NodeScope}. Reads dragged state for plop validation,
 * so it does not touch pick state.
 */
function useDragForNode(
  node: RaisinNode | undefined,
  options?: UseDragOptions
) {
  const {
    DraggedAtom,
    DraggingIsActive,
    DraggedNodeAtom,
    LastHoveredPlopAtom,
    TryCommitLastHoveredAtom,
  } = useMolecule(DragAndDropMolecule);
  const setDraggedNode = useSetAtom(DraggedNodeAtom);
  const setDragged = useSetAtom(DraggedAtom);
  const setLastHovered = useSetAtom(LastHoveredPlopAtom);
  const tryCommit = useSetAtom(TryCommitLastHoveredAtom);
  const isDragging = useAtomValue(DraggingIsActive);
  const draggedNode = useAtomValue(DraggedNodeAtom);
  const { applyGhost, removeGhost } = useDragGhost(options?.ghost);

  const isThisNodeDragged = node !== undefined && draggedNode === node;

  const onDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!node) return;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'node');
      applyGhost(e);
      setDraggedNode(node);
    },
    [node, setDraggedNode, applyGhost]
  );

  const onDragEnd = useCallback(() => {
    removeGhost();
    // Fallback drop for the sandboxed canvas iframe (see useDragBlock).
    tryCommit();
    setDragged(undefined);
    setLastHovered(undefined);
  }, [tryCommit, setDragged, setLastHovered, removeGhost]);

  return {
    draggable: true,
    onDragStart,
    onDragEnd,
    isDragging: isThisNodeDragged,
    anyDragging: isDragging,
  };
}

/**
 * Hook for making an existing element layer draggable (for move operations).
 * Also sets PickedNodeAtom so that plop target validation works.
 *
 * By default the dragged node is the current {@link NodeScope} node (matching
 * the previous behaviour). Pass `nodeOverride` to drag a specific node instead
 * — useful from overlays that live outside of the node's scope. See
 * {@link useDragSelectedNode} for a convenience wrapper that drags the selected
 * node.
 */
export function useDragNode(
  nodeOverride?: RaisinNode,
  options?: UseDragOptions
) {
  const { nodeAtom } = useMolecule(NodeMolecule);
  const scopeNode = useAtomValue(nodeAtom);
  return useDragForNode(nodeOverride ?? scopeNode, options);
}

/**
 * Drag handle for moving the currently selected element. Reads the node from
 * {@link SelectedNodeMolecule} (not the surrounding scope), so it works from
 * overlays like a canvas toolbar.
 */
export function useDragSelectedNode(options?: UseDragOptions) {
  const { SelectedNodeAtom } = useMolecule(SelectedNodeMolecule);
  const selectedNode = useAtomValue(SelectedNodeAtom);
  return useDragForNode(selectedNode, options);
}

export type DropTargetProps = {
  idx: number;
  slot: string;
};

/**
 * Makes a plop target accept drops via the HTML Drag and Drop API. Validity
 * comes from `canPlopHereAtom`; a valid drop invokes `DropNodeInSlotAtom`.
 */
export function useDropTarget({ idx, slot }: DropTargetProps) {
  const { DraggingIsActive, DropNodeInSlotAtom, LastHoveredPlopAtom } =
    useMolecule(DragAndDropMolecule);
  const { canPlopHereAtom, nodeAtom } = useMolecule(NodeMolecule);

  const isDragging = useAtomValue(DraggingIsActive);
  const canPlop = useAtomValue(canPlopHereAtom);
  const node = useAtomValue(nodeAtom);
  const dropNode = useSetAtom(DropNodeInSlotAtom);
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
    },
    [isDroppable, dropNode, node, idx, slot]
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
