import type { RaisinNode } from '@raisins/core';
import type { VNode, VNodeChildren, VNodeData } from 'snabbdom';

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

export type RaisinVNode = Omit<VNode, 'data'> & {
  data?: RaisinVNodeData;
};

export type RaisinVNodeData = VNodeData & {
  /**
   * Content of the shadow dom
   */
  shadowContent?: string;
};

export type RootRenderer = (
  children: VNodeChildren,
  document: RaisinNode
) => VNodeChildren;
