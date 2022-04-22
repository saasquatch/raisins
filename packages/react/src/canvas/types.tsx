/**
 * A rectangle for on-canvas positioning.
 *
 * Roughly mirrors the {@link DOMRect} browser API. https://developer.mozilla.org/en-US/docs/Web/API/DOMRect
 */
export type Rect = {
  x: number;
  y: number;
  height: number;
  width: number;
};
