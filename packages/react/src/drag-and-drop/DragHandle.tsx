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
 * Wraps an element as a reliable native drag source. Spread the props from
 * {@link useDragNode}/{@link useDragSelectedNode}/{@link useDragBlock}.
 *
 * ```tsx
 * <DragHandle {...useDragSelectedNode({ ghost })} title="Drag to move">
 *   <MoveIcon />
 * </DragHandle>
 * ```
 *
 * A plain span is the drag source and a real intermediate box blocks the
 * child's pointer events — `draggable` on an interactive `display: contents`
 * web component fails (host generates no box, so `pointer-events` is ignored).
 * Don't wrap in components that remount children (e.g. tooltips with unstable
 * keys): a remount mid-drag aborts the drag.
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
