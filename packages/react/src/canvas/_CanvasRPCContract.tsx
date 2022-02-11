import type { VNode } from 'snabbdom';

export type GeometryDetail = {
  entries: GeometryEntry[];
};
export type GeometryEntry = {
  contentRect: Omit<DOMRectReadOnly,"toJSON">
  target?: {
    attributes: Record<string, string>;
  };
};

/**
 * DOM event from inside the canvas.
 */
export type CanvasEvent = {
  /**
   * A DOM event type.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/Events
   */
  type: string;
  /**
   * The serializable representation of the DOM Element
   * closest parent that matches the `selector`, not necessarily the
   * DOM element that triggered the event.
   */
  target?: {
    attributes: Record<string, string>;
    rect: DOMRect;
  };
};

export type ParentRPC = {
  resizeHeight(pixels: string): void;
  event(event: CanvasEvent): void;
  geometry(detail: GeometryDetail): void;
};

export type ChildRPC = {
  render(html: VNode): void;
  geometry(): GeometryDetail;
};
