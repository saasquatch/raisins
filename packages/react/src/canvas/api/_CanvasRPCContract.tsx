import type { VNode } from 'snabbdom';

export type GeometryDetail = {
  entries: GeometryEntry[];
  /**
   * When true, the entries represent a complete snapshot of all currently
   * tracked elements (produced by `dispatchResizeAll` after a render).
   * Consumers should *replace* their previous entries with this set rather
   * than merging, so that elements which no longer exist (e.g. plop targets
   * removed when a pick/drag ends) are evicted from the parent cache.
   *
   * When falsy/undefined, the entries are a partial delta (e.g. from a
   * `ResizeObserver` callback) and should be merged into the existing cache.
   */
  full?: boolean;
};
export type GeometryEntry = {
  contentRect: Omit<DOMRectReadOnly, 'toJSON'>;
  target?: {
    attributes: Record<string, string>;
  };
};

/**
 * DOM event from inside the canvas.
 */
export type RawCanvasEvent = {
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
  event(event: RawCanvasEvent): void;
  geometry(detail: GeometryDetail): void;
};

export type ChildRPC = {
  render(html: VNode): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postMessage(data: any, targetOrigin: string): void;
};
