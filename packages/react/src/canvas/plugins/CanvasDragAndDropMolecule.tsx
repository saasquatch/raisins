import {
  calculatePlopTargets,
  isElementNode,
  isRoot,
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { CustomElement } from '@raisins/schema/schema';
import { atom, Atom, useAtomValue, useSetAtom } from 'jotai';
import { molecule, useMolecule } from 'bunshi/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ComponentModelMolecule } from '../../component-metamodel';
import { CoreMolecule, SoulsInDocMolecule, SoulsMolecule } from '../../core';
import {
  DragAndDropMolecule,
  DragPlopDestination,
} from '../../core/selection/DragAndDropMolecule';
import { CanvasConfigMolecule } from '../CanvasConfig';
import { CanvasScopeMolecule } from '../CanvasScopeMolecule';

/**
 * Synthetic component metadata used as the "parent meta" when the drop parent
 * is the document root (which has no tag name and therefore no registered
 * metadata). Root accepts a single default content slot.
 */
const ROOT_META: CustomElement = {
  tagName: '',
  title: 'Body',
  slots: [{ name: '', title: 'Content' }],
};

// ---------------------------------------------------------------------------
// Pure geometry helpers for the BeeFree-style drop indicator.
//
// All coordinates here are in the canvas iframe's own (iframe-relative)
// coordinate space, the same space as plop/soul geometry rects.
// ---------------------------------------------------------------------------

type Rect = { left: number; top: number; right: number; bottom: number };

type Axis = 'vertical' | 'horizontal';

/**
 * An insertion line as a segment. For a vertical stack the segment is
 * horizontal (constant y); for a horizontal row it is vertical (constant x).
 */
type InsertionLine = {
  axis: Axis;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
};

function rectArea(r: Rect): number {
  return Math.max(0, r.right - r.left) * Math.max(0, r.bottom - r.top);
}

function rectContains(r: Rect, x: number, y: number): boolean {
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

/** Smallest box enclosing all rects, or undefined when empty. */
function bbox(rects: Rect[]): Rect | undefined {
  if (rects.length === 0) return undefined;
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const r of rects) {
    if (r.left < left) left = r.left;
    if (r.top < top) top = r.top;
    if (r.right > right) right = r.right;
    if (r.bottom > bottom) bottom = r.bottom;
  }
  return { left, top, right, bottom };
}

/**
 * Detect whether sibling rects are laid out vertically or horizontally by
 * summing absolute center-to-center deltas along each axis. Fewer than two
 * rects defaults to vertical (the common email-layout case).
 */
function detectAxis(rects: Rect[]): Axis {
  if (rects.length < 2) return 'vertical';
  let dx = 0;
  let dy = 0;
  for (let i = 1; i < rects.length; i++) {
    const a = rects[i - 1];
    const b = rects[i];
    dx += Math.abs((b.left + b.right) / 2 - (a.left + a.right) / 2);
    dy += Math.abs((b.top + b.bottom) / 2 - (a.top + a.bottom) / 2);
  }
  return dx > dy ? 'horizontal' : 'vertical';
}

/** Shortest distance from a point to a line segment. */
function distanceToLine(x: number, y: number, line: InsertionLine): number {
  const dx = line.x1 - line.x0;
  const dy = line.y1 - line.y0;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(x - line.x0, y - line.y0);
  let t = ((x - line.x0) * dx + (y - line.y0) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(x - (line.x0 + t * dx), y - (line.y0 + t * dy));
}

/**
 * Build the insertion line for the gap between an optional previous sibling
 * and an optional next sibling, given the layout axis and a fallback
 * container rect (used at the very start/end or for an empty container).
 */
function insertionLineForGap(
  axis: Axis,
  prev: Rect | undefined,
  next: Rect | undefined,
  container: Rect | undefined
): InsertionLine {
  if (axis === 'vertical') {
    const y =
      prev && next
        ? (prev.bottom + next.top) / 2
        : next
        ? next.top
        : prev
        ? prev.bottom
        : container
        ? container.top + 2
        : 0;
    const span = container ?? next ?? prev;
    return {
      axis,
      x0: span ? span.left : 0,
      y0: y,
      x1: span ? span.right : 0,
      y1: y,
    };
  }
  const x =
    prev && next
      ? (prev.right + next.left) / 2
      : next
      ? next.left
      : prev
      ? prev.right
      : container
      ? container.left + 2
      : 0;
  const span = container ?? next ?? prev;
  return {
    axis,
    x0: x,
    y0: span ? span.top : 0,
    x1: x,
    y1: span ? span.bottom : 0,
  };
}

/**
 * A resolved drop placement: where the node will land plus the geometry
 * needed to render the parent highlight and insertion indicator. All rects
 * and the line are in iframe-relative coordinates.
 */
export type DropResolution = {
  destination: DragPlopDestination;
  parentRect?: Rect;
  line: InsertionLine;
  label: string;
};

/**
 * Canvas-side drag-and-drop.
 *
 * The canvas iframe is sandboxed (`allow-scripts`, no `allow-same-origin`), so
 * the browser never delivers parent-initiated drag events into it. Instead we
 * drive drops from the parent: while dragging, the iframe gets
 * `pointer-events: none` so the wrapper receives events; on `dragover` we
 * hit-test the cursor against souled-element rects from `GeometryAtom` (no plop
 * targets injected, so the canvas never reflows) and commit on `drop`.
 *
 * Wrap the canvas with {@link CanvasDragDropWrapper} or {@link useCanvasDragDrop}.
 */
export const CanvasDragAndDropMolecule = molecule(getMol => {
  const CanvasAtoms = getMol(CanvasScopeMolecule);
  const {
    DropNodeInSlotAtom,
    LastHoveredPlopAtom,
    DraggingIsActive,
    DraggedAtom,
    DraggedContentAtom,
  } = getMol(DragAndDropMolecule);
  const { IdToSoulAtom, SoulToNodeAtom } = getMol(SoulsInDocMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);
  const { ParentsAtom, RootNodeAtom } = getMol(CoreMolecule);
  const { ComponentModelAtom } = getMol(ComponentModelMolecule);
  const { SoulAttributeAtom } = getMol(CanvasConfigMolecule);

  /**
   * Resolves a drop placement from a cursor position (in iframe-relative
   * coordinates) using only the geometry of existing souled elements — no
   * injected plop targets. Returns a function so callers can hit-test many
   * cursor positions against one geometry snapshot.
   *
   * Algorithm (implements the "drop into the closest valid container" rule):
   *   1. Find every souled element whose rect contains the cursor.
   *   2. Pick the DEEPEST such element that yields valid plop targets — a
   *      cursor inside a child is, by definition, closer than the parent's
   *      edge, so nested containers win. Fall back to the document root.
   *   3. Detect the container's layout axis from its children's rects.
   *   4. For each valid target compute an insertion line and choose the one
   *      nearest the cursor.
   */
  const ResolveDropAtom: Atom<(x: number, y: number) => DropResolution | undefined> = atom(
    get => {
      const geo = get(CanvasAtoms.GeometryAtom);
      const idToSoul = get(IdToSoulAtom);
      const soulToNode = get(SoulToNodeAtom);
      const parents = get(ParentsAtom);
      const root = get(RootNodeAtom);
      const metamodel = get(ComponentModelAtom);
      const dragged = get(DraggedAtom);
      const soulAttr = get(SoulAttributeAtom);

      const noop = () => undefined;
      if (!dragged) return noop;
      const possiblePlop = get(DraggedContentAtom);
      if (!possiblePlop || !isElementNode(possiblePlop)) return noop;
      const addOrMove = dragged.type === 'block' ? 'add' : 'move';

      // node -> rect (iframe-relative), only for souled elements.
      const rectByNode = new Map<RaisinNode, Rect>();
      for (const e of geo.entries) {
        const attrs = e.target?.attributes;
        if (!attrs) continue;
        const soulId = attrs[soulAttr];
        if (!soulId) continue;
        const soul = idToSoul(soulId);
        if (!soul) continue;
        const node = soulToNode(soul);
        if (!node) continue;
        const r = e.contentRect;
        rectByNode.set(node, {
          left: r.left,
          top: r.top,
          right: r.right,
          bottom: r.bottom,
        });
      }
      const rectForNode = (n: RaisinNode): Rect | undefined => rectByNode.get(n);

      const depthOf = (n: RaisinNode): number => {
        let d = 0;
        let c = parents.get(n);
        while (c) {
          d++;
          c = parents.get(c);
        }
        return d;
      };

      const tryParent = (parentNode: RaisinNode) => {
        if (!isElementNode(parentNode) && !isRoot(parentNode)) return undefined;
        const parentMeta = isRoot(parentNode)
          ? ROOT_META
          : metamodel.getComponentMeta((parentNode as RaisinElementNode).tagName);
        const possiblePlopMeta = metamodel.getComponentMeta(possiblePlop.tagName);
        const targets = calculatePlopTargets(
          parentNode,
          possiblePlop,
          { parentMeta, possiblePlopMeta },
          parents
        );
        if (!targets.length) return undefined;
        return { parentNode, parentMeta, targets };
      };

      const lineForTarget = (
        parentNode: RaisinNodeWithChildren,
        target: { idx: number; slot: string },
        axis: Axis,
        parentRect: Rect | undefined
      ): InsertionLine => {
        let prevRect: Rect | undefined;
        let nextRect: Rect | undefined;
        for (let i = target.idx - 1; i >= 0; i--) {
          const ch = parentNode.children[i];
          if (
            isElementNode(ch) &&
            ((ch as RaisinElementNode).attribs.slot ?? '') === target.slot
          ) {
            prevRect = rectForNode(ch);
            if (prevRect) break;
          }
        }
        for (let i = target.idx; i < parentNode.children.length; i++) {
          const ch = parentNode.children[i];
          if (
            isElementNode(ch) &&
            ((ch as RaisinElementNode).attribs.slot ?? '') === target.slot
          ) {
            nextRect = rectForNode(ch);
            if (nextRect) break;
          }
        }
        return insertionLineForGap(axis, prevRect, nextRect, parentRect);
      };

      return (x: number, y: number): DropResolution | undefined => {
        const containing: { node: RaisinNode; rect: Rect }[] = [];
        for (const [node, rect] of rectByNode) {
          if (rectContains(rect, x, y)) containing.push({ node, rect });
        }
        containing.sort((a, b) => {
          const dd = depthOf(b.node) - depthOf(a.node);
          if (dd !== 0) return dd;
          return rectArea(a.rect) - rectArea(b.rect);
        });

        let chosen:
          | {
              parentNode: RaisinNode;
              parentMeta: CustomElement;
              targets: { idx: number; slot: string }[];
              parentRect?: Rect;
            }
          | undefined;
        for (const c of containing) {
          const r = tryParent(c.node);
          if (r) {
            chosen = { ...r, parentRect: c.rect };
            break;
          }
        }
        if (!chosen) {
          const r = tryParent(root);
          if (!r) return undefined;
          const childRects = (root as RaisinNodeWithChildren).children
            .filter(isElementNode)
            .map(rectForNode)
            .filter((x2): x2 is Rect => !!x2);
          chosen = { ...r, parentRect: bbox(childRects) };
        }

        const parentNode = chosen.parentNode as RaisinNodeWithChildren;
        const { parentMeta, targets, parentRect } = chosen;

        const childRects = parentNode.children
          .filter(isElementNode)
          .map(rectForNode)
          .filter((x2): x2 is Rect => !!x2);
        const axis = detectAxis(childRects);

        let best: { t: { idx: number; slot: string }; line: InsertionLine } | undefined;
        let bestDist = Infinity;
        for (const t of targets) {
          const line = lineForTarget(parentNode, t, axis, parentRect);
          const d = distanceToLine(x, y, line);
          if (d < bestDist) {
            bestDist = d;
            best = { t, line };
          }
        }
        if (!best) return undefined;

        const slotTitle =
          parentMeta?.slots?.find(s => s.name === best!.t.slot)?.title ||
          parentMeta?.title ||
          'Content';

        return {
          destination: { parent: parentNode, idx: best.t.idx, slot: best.t.slot },
          parentRect,
          line: best.line,
          label: `${addOrMove === 'add' ? 'Add' : 'Move'} to ${slotTitle}`,
        };
      };
    }
  );

  return {
    GeometryAtom: CanvasAtoms.GeometryAtom,
    DraggingIsActive,
    DropNodeInSlotAtom,
    LastHoveredPlopAtom,
    ResolveDropAtom,
  };
});

/**
 * Wraps the canvas so native drag events fire on the parent-side wrapper
 * instead of being swallowed by the sandboxed iframe. Renders a BeeFree-style
 * drop indicator (container highlight, insertion line, action pill) from
 * souled-element geometry — no plop targets injected, so the canvas never
 * reflows.
 *
 * The wrapper is `position: relative` + `isolation: isolate`; being positioned,
 * it paints above `z-index: 0` siblings, so sibling overlays (toolbars) need
 * `z-index >= 1`.
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
    overlay,
  } = useCanvasDragDrop();

  return (
    <div
      ref={containerRef}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{ position: 'relative', isolation: 'isolate', ...style }}
      className={className}
    >
      {children}
      {isDragging && overlay && (
        <>
          {overlay.border && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                left: overlay.border.left,
                top: overlay.border.top,
                width: overlay.border.width,
                height: overlay.border.height,
                border: '1px solid #0077DB',
                borderRadius: '2px',
                background: 'rgba(0, 119, 219, 0.06)',
                boxSizing: 'border-box',
                pointerEvents: 'none',
                zIndex: 9998,
              }}
            />
          )}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: overlay.line.left,
              top: overlay.line.top,
              width: overlay.line.width,
              height: overlay.line.height,
              background: '#0077DB',
              borderRadius: '2px',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: overlay.pill.left,
              top: overlay.pill.top,
              transform: 'translate(-50%, -50%)',
              background: '#0077DB',
              color: '#fff',
              fontSize: '12px',
              lineHeight: '16px',
              padding: '4px 8px',
              borderRadius: '100px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10000,
            }}
          >
            {overlay.pill.text}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Wrapper-local overlay geometry (relative to the wrapping container), derived
 * from an iframe-relative {@link DropResolution}.
 */
type DropOverlay = {
  border?: { left: number; top: number; width: number; height: number };
  line: { left: number; top: number; width: number; height: number };
  pill: { left: number; top: number; text: string };
};

const LINE_THICKNESS = 3;

/**
 * Lower-level hook for integrating canvas drag-and-drop into a custom
 * container. Spread the returned handlers onto a wrapping element and
 * attach the ref to it. The element must contain (directly or transitively)
 * the canvas iframe.
 */
export function useCanvasDragDrop() {
  const {
    DraggingIsActive,
    DropNodeInSlotAtom,
    LastHoveredPlopAtom,
    ResolveDropAtom,
  } = useMolecule(CanvasDragAndDropMolecule);

  const isDragging = useAtomValue(DraggingIsActive);
  const resolveDrop = useAtomValue(ResolveDropAtom);
  const setLastHovered = useSetAtom(LastHoveredPlopAtom);
  const dropNode = useSetAtom(DropNodeInSlotAtom);

  const containerRef = useRef<HTMLDivElement>(null);
  // Mirror of the latest resolved destination so `onDrop` does not depend on
  // potentially-stale React state when committing.
  const currentDestRef = useRef<DragPlopDestination | null>(null);
  const [overlay, setOverlay] = useState<DropOverlay | undefined>();

  // Disable pointer-events on the iframe while a drag is active so the
  // wrapper element actually receives drag events from the parent window.
  useEffect(() => {
    const iframe = containerRef.current?.querySelector('iframe');
    if (!iframe) return;
    if (isDragging) {
      iframe.style.pointerEvents = 'none';
      return () => {
        iframe.style.pointerEvents = '';
        currentDestRef.current = null;
        setOverlay(undefined);
      };
    }
    return undefined;
  }, [isDragging]);

  // Convert an iframe-relative resolution into wrapper-local overlay geometry.
  const computeOverlay = useCallback(
    (res: DropResolution): DropOverlay | undefined => {
      const container = containerRef.current;
      const iframe = container?.querySelector('iframe');
      if (!container || !iframe) return undefined;
      const containerRect = container.getBoundingClientRect();
      const iframeRect = iframe.getBoundingClientRect();
      const ox = iframeRect.left - containerRect.left;
      const oy = iframeRect.top - containerRect.top;

      const border = res.parentRect
        ? {
            left: ox + res.parentRect.left,
            top: oy + res.parentRect.top,
            width: res.parentRect.right - res.parentRect.left,
            height: res.parentRect.bottom - res.parentRect.top,
          }
        : undefined;

      const { line } = res;
      let lineBox: DropOverlay['line'];
      if (line.axis === 'vertical') {
        // Horizontal bar.
        lineBox = {
          left: ox + Math.min(line.x0, line.x1),
          top: oy + line.y0 - LINE_THICKNESS / 2,
          width: Math.abs(line.x1 - line.x0),
          height: LINE_THICKNESS,
        };
      } else {
        // Vertical bar.
        lineBox = {
          left: ox + line.x0 - LINE_THICKNESS / 2,
          top: oy + Math.min(line.y0, line.y1),
          width: LINE_THICKNESS,
          height: Math.abs(line.y1 - line.y0),
        };
      }

      const pill = {
        left: ox + (line.x0 + line.x1) / 2,
        top: oy + (line.y0 + line.y1) / 2,
        text: res.label,
      };

      return { border, line: lineBox, pill };
    },
    []
  );

  const clear = useCallback(() => {
    currentDestRef.current = null;
    setOverlay(undefined);
    setLastHovered(undefined);
  }, [setLastHovered]);

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!isDragging) return;
      const iframe = containerRef.current?.querySelector('iframe');
      if (!iframe) return;
      const iframeRect = iframe.getBoundingClientRect();
      const x = e.clientX - iframeRect.left;
      const y = e.clientY - iframeRect.top;

      const res = resolveDrop(x, y);
      if (!res) {
        currentDestRef.current = null;
        setOverlay(undefined);
        setLastHovered(undefined);
        return;
      }
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      currentDestRef.current = res.destination;
      setOverlay(computeOverlay(res));
      setLastHovered(res.destination);
    },
    [isDragging, resolveDrop, computeOverlay, setLastHovered]
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
      clear();
    },
    [clear]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      if (!isDragging) return;
      // Prefer the most recently tracked destination (set by the just-fired
      // dragover) over re-resolving here.
      const tracked = currentDestRef.current;
      if (tracked) {
        e.preventDefault();
        dropNode(tracked);
        clear();
        return;
      }
      const iframe = containerRef.current?.querySelector('iframe');
      if (!iframe) return;
      const iframeRect = iframe.getBoundingClientRect();
      const res = resolveDrop(e.clientX - iframeRect.left, e.clientY - iframeRect.top);
      if (!res) return;
      e.preventDefault();
      dropNode(res.destination);
      clear();
    },
    [isDragging, resolveDrop, dropNode, clear]
  );

  return {
    containerRef,
    onDragOver,
    onDragLeave,
    onDrop,
    isDragging,
    overlay,
  };
}
