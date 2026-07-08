import React from 'react';

export type DragHandleProps = {
  /** Spread the return value of `useDragNode`/`useDragSelectedNode`/`useDragBlock`. */
  draggable: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  /** Native tooltip. Prefer this over tooltip components that remount their child. */
  title?: string;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
};

/**
 * Wraps an arbitrary element (icon, button, web component) so it reliably
 * acts as a native HTML5 drag source. Spread the props returned by
 * {@link useDragNode}, {@link useDragSelectedNode} or {@link useDragBlock}:
 *
 * ```tsx
 * const drag = useDragSelectedNode({ ghost: { width, height } });
 * <DragHandle {...drag} title="Drag to move">
 *   <MoveIcon />
 * </DragHandle>
 * ```
 *
 * Why not put `draggable` on the child directly? Interactive children —
 * especially web components that render an inner `<button>` and lay out with
 * `display: contents` — capture the mousedown themselves, and
 * `pointer-events: none` on a `display: contents` host has no effect (it
 * generates no box). This wrapper makes a plain span the drag source and
 * blocks the child's pointer events through a real intermediate box, so the
 * drag starts regardless of what the child renders.
 *
 * Note: do not wrap a DragHandle in components that remount their children on
 * re-render (e.g. tooltip wrappers using unstable `key`s) — a remount mid-drag
 * aborts the native drag.
 */
export function DragHandle({
  draggable,
  onDragStart,
  onDragEnd,
  title,
  style,
  className,
  children,
}: DragHandleProps) {
  return (
    <span
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      title={title}
      className={className}
      style={{ display: 'inline-flex', cursor: 'grab', ...style }}
    >
      <span style={{ display: 'inline-flex', pointerEvents: 'none' }}>
        {children}
      </span>
    </span>
  );
}
