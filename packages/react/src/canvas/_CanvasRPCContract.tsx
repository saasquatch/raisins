import type { VNode } from 'snabbdom';
import type { CanvasEvent } from './SnabbdomSanboxedIframeAtom';

export type ParentRPC = {
  resizeHeight(pixels: string): void;
  event(event: CanvasEvent): void;
};

export type ChildRPC = {
  render(html: VNode): void;
};
