import {
  cssSerializer,
  htmlUtil,
  RaisinDocumentNode,
  RaisinNode,
} from '@raisins/core';
import { h, VNode, VNodeData } from 'snabbdom';
import styleToObject from 'style-to-object';
const { visit } = htmlUtil;

const GLOBAL_ENTRY = 'body';

/**
 * Modifies a Snabbdom node
 * 
 * Useful for adding additional styling (e.g. selected styling) and props
 * 
 */
export type SnabdomRenderer = (d: VNodeData, n: RaisinNode) => VNodeData;

export function raisintoSnabdom(
  node: RaisinDocumentNode,
  modifier: SnabdomRenderer = (d, n) => d
): VNode {
  const vnode = visit<VNode | string>(node, {
    onComment(c) {
      return undefined;
    },
    onStyle(el) {
      return h('style', {}, el.contents && cssSerializer(el.contents));
    },
    onElement(el, children) {
      let styleObj;
      try {
        if (el.style) {
          styleObj = styleToObject(cssSerializer(el.style));
        }
      } finally {
        styleObj = styleObj || {};
      }

      return h(
        el.tagName,
        modifier({ attrs: el.attribs, style: styleObj }, el),
        children
      );
    },
    onText(text) {
      return text.data;
    },
    onRoot(_, children) {
      return h(GLOBAL_ENTRY, {}, children);
    },
  });

  return vnode as VNode;
}
