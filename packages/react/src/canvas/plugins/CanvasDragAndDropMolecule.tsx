import {
  RaisinDocumentNode,
  RaisinElementNode,
} from '@raisins/core';
import { atom, Atom, useAtomValue, useSetAtom } from 'jotai';
import { molecule, useMolecule } from 'bunshi/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SoulsInDocMolecule } from '../../core';
import {
  DragAndDropMolecule,
  DragPlopDestination,
} from '../../core/selection/DragAndDropMolecule';
import { GeometryEntry } from '../api/_CanvasRPCContract';
import { CanvasScopeMolecule } from '../CanvasScopeMolecule';

/**
 * Canvas-side drag-and-drop support.
 *
 * ## Why we don't use drag events from inside the iframe
 *
 * The canvas iframe uses `sandbox="allow-scripts"` (no `allow-same-origin`),
 * which puts it at a null/opaque origin. Browsers do not deliver drag events
 * initiated in the parent window across this boundary — `dragenter`,
 * `dragover`, `dragleave`, and `drop` never fire inside the iframe document
 * for parent-initiated drags. CSS `:hover` is similarly suppressed.
 *
 * ## Parent-side overlay approach
 *
 * Instead, we drive drops entirely from the parent window:
 *   1. `CanvasPickAndPlopMolecule` already renders plop targets inside the
 *      iframe whenever a drag/pick is active. Their geometry is forwarded
 *      to `GeometryAtom` thanks to `resizeObserver: true` + the plop-target
 *      entries we keep in `SetGeometryAtom`.
 *   2. While a drag is active, the iframe is given `pointer-events: none`
 *      so the parent's wrapping container receives drag events instead of
 *      them being captured by the iframe element.
 *   3. On `dragover` on the wrapper, we hit-test the cursor position
 *      against plop target rects from `GeometryAtom`, set
 *      `LastHoveredPlopAtom`, and `preventDefault()` so `drop` will fire.
 *   4. On `drop` on the wrapper, we commit via `DropNodeInSlotAtom`.
 *
 * Use {@link CanvasDragDropWrapper} (or {@link useCanvasDragDrop}) to wrap
 * the canvas container.
 */
export const CanvasDragAndDropMolecule = molecule(getMol => {
  const CanvasAtoms = getMol(CanvasScopeMolecule);
  const {
    DropNodeInSlotAtom,
    LastHoveredPlopAtom,
    DraggingIsActive,
  } = getMol(DragAndDropMolecule);
  const { IdToSoulAtom, SoulToNodeAtom } = getMol(SoulsInDocMolecule);

  /**
   * Resolves a plop target geometry entry into a concrete drop destination.
   */
  const ResolvePlopAtom: Atom<
    (geo: GeometryEntry) => DragPlopDestination | undefined
  > = atom(get => {
    const idToSoul = get(IdToSoulAtom);
    const soulToNode = get(SoulToNodeAtom);
    return (geo: GeometryEntry) => {
      const attrs = geo.target?.attributes;
      // Boolean snabbdom attrs serialize to empty strings on the DOM, so we
      // test with `in` rather than truthiness.
      if (!attrs || !('raisin-plop-target' in attrs)) return undefined;
      const parentSoulId = attrs['raisin-plop-parent'];
      if (!parentSoulId) return undefined;
      const parentSoul = idToSoul(parentSoulId);
      if (!parentSoul) return undefined;
      const parentNode = soulToNode(parentSoul) as
        | RaisinElementNode
        | RaisinDocumentNode
        | undefined;
      if (!parentNode) return undefined;
      const idx = Number(attrs['raisin-plop-idx']);
      const slot = attrs['raisin-plop-slot'] ?? '';
      return { parent: parentNode, idx, slot };
    };
  });

  return {
    GeometryAtom: CanvasAtoms.GeometryAtom,
    DraggingIsActive,
    DropNodeInSlotAtom,
    LastHoveredPlopAtom,
    ResolvePlopAtom,
  };
});

/**
 * Wraps the canvas container so that native HTML5 drag events fire on the
 * parent-side wrapper instead of being swallowed by the cross-origin
 * sandboxed iframe. Inside this wrapper, render your canvas controller.
 *
 * Also renders a parent-side overlay highlighting the currently-hovered
 * plop target. The overlay is positioned absolutely over the plop target
 * rect using the same geometry the hit-test uses, so it updates instantly
 * (no iframe round-trip) and does not feed back into geometry (no
 * "magnet trap" where an enlarged plop captures subsequent dragovers).
 */
export function CanvasDragDropWrapper({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  const {
    containerRef,
    onDragOver,
    onDragLeave,
    onDrop,
    isDragging,
    overlayRect,
  } = useCanvasDragDrop();

  return (
    <div
      ref={containerRef}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{ position: 'relative', ...style }}
      className={className}
    >
      {children}
      {isDragging && overlayRect && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: overlayRect.left,
            top: overlayRect.top,
            width: overlayRect.width,
            height: Math.max(overlayRect.height, 4),
            background: '#0077DB',
            borderRadius: '2px',
            boxShadow: '0 0 0 2px rgba(0, 119, 219, 0.25)',
            pointerEvents: 'none',
            zIndex: 9999,
            transition: 'transform 80ms ease-out, opacity 80ms ease-out',
          }}
        />
      )}
    </div>
  );
}

type OverlayRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * Lower-level hook for integrating canvas drag-and-drop into a custom
 * container. Spread the returned handlers onto a wrapping element and
 * attach the ref to it. The element must contain (directly or transitively)
 * the canvas iframe.
 */
export function useCanvasDragDrop() {
  const {
    GeometryAtom,
    DraggingIsActive,
    DropNodeInSlotAtom,
    LastHoveredPlopAtom,
    ResolvePlopAtom,
  } = useMolecule(CanvasDragAndDropMolecule);

  const isDragging = useAtomValue(DraggingIsActive);
  const geometry = useAtomValue(GeometryAtom);
  const resolvePlop = useAtomValue(ResolvePlopAtom);
  const setLastHovered = useSetAtom(LastHoveredPlopAtom);
  const dropNode = useSetAtom(DropNodeInSlotAtom);

  const containerRef = useRef<HTMLDivElement>(null);
  // Mirror of the latest hit + destination so `onDrop` does not depend on
  // potentially-stale React state when committing.
  const currentHitRef = useRef<{
    dest: DragPlopDestination;
    rect: OverlayRect;
  } | null>(null);
  const [overlayRect, setOverlayRect] = useState<OverlayRect | undefined>();

  // Disable pointer-events on the iframe while a drag is active so the
  // wrapper element actually receives drag events from the parent window.
  useEffect(() => {
    const iframe = containerRef.current?.querySelector('iframe');
    if (!iframe) return;
    if (isDragging) {
      iframe.style.pointerEvents = 'none';
      return () => {
        iframe.style.pointerEvents = '';
        currentHitRef.current = null;
        setOverlayRect(undefined);
      };
    }
    return undefined;
  }, [isDragging]);

  const findPlopUnderCursor = useCallback(
    (clientX: number, clientY: number) => {
      const iframe = containerRef.current?.querySelector('iframe');
      if (!iframe) return undefined;
      const iframeRect = iframe.getBoundingClientRect();
      // Geometry rects are in iframe-relative coordinates.
      const x = clientX - iframeRect.left;
      const y = clientY - iframeRect.top;
      const hit = geometry.entries.find(g => {
        const attrs = g.target?.attributes;
        if (!attrs || !('raisin-plop-target' in attrs)) return false;
        const r = g.contentRect;
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      });
      return hit;
    },
    [geometry]
  );

  const computeOverlayRect = useCallback(
    (hit: GeometryEntry): OverlayRect | undefined => {
      const container = containerRef.current;
      const iframe = container?.querySelector('iframe');
      if (!container || !iframe) return undefined;
      const containerRect = container.getBoundingClientRect();
      const iframeRect = iframe.getBoundingClientRect();
      const r = hit.contentRect;
      // Translate iframe-local rect into wrapper-local rect.
      return {
        left: iframeRect.left - containerRect.left + r.left,
        top: iframeRect.top - containerRect.top + r.top,
        width: r.width,
        height: r.height,
      };
    },
    []
  );

  const clearHit = useCallback(() => {
    currentHitRef.current = null;
    setOverlayRect(undefined);
    setLastHovered(undefined);
  }, [setLastHovered]);

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!isDragging) return;
      const hit = findPlopUnderCursor(e.clientX, e.clientY);
      if (!hit) {
        clearHit();
        return;
      }
      const dest = resolvePlop(hit);
      if (!dest) {
        clearHit();
        return;
      }
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const rect = computeOverlayRect(hit);
      currentHitRef.current = rect ? { dest, rect } : { dest, rect: { left: 0, top: 0, width: 0, height: 0 } };
      setOverlayRect(rect);
      setLastHovered(dest);
    },
    [
      isDragging,
      findPlopUnderCursor,
      resolvePlop,
      computeOverlayRect,
      clearHit,
      setLastHovered,
    ]
  );

  const onDragLeave = useCallback(
    (e: React.DragEvent) => {
      // Only clear when leaving the wrapper entirely (not its child elements).
      if (
        e.currentTarget instanceof HTMLElement &&
        e.relatedTarget instanceof Node &&
        e.currentTarget.contains(e.relatedTarget)
      ) {
        return;
      }
      clearHit();
    },
    [clearHit]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      if (!isDragging) return;
      // Prefer the most recently tracked hit (set by the just-fired dragover)
      // over re-hit-testing here, which would otherwise rely on the same
      // geometry snapshot but is one render behind for the cursor position.
      const tracked = currentHitRef.current;
      if (tracked) {
        e.preventDefault();
        dropNode(tracked.dest);
        clearHit();
        return;
      }
      const hit = findPlopUnderCursor(e.clientX, e.clientY);
      if (!hit) return;
      const dest = resolvePlop(hit);
      if (!dest) return;
      e.preventDefault();
      dropNode(dest);
      clearHit();
    },
    [isDragging, findPlopUnderCursor, resolvePlop, dropNode, clearHit]
  );

  return {
    containerRef,
    onDragOver,
    onDragLeave,
    onDrop,
    isDragging,
    overlayRect,
  };
}
