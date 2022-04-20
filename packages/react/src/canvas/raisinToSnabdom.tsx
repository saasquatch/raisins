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

/**
 * Combines a set of {@link SnabdomRenderer} into a single {@link SnabdomRenderer}
 */
export function combineRenderers(
  ...renderers: SnabdomRenderer[]
): SnabdomRenderer {
  return (d, n) => {
    return renderers.reduce((previous, renderer) => {
      return renderer(previous, n);
    }, d);
  };
}

export type SnabdomAppender = (
  children: Array<VNode | string> | undefined,
  n: RaisinNode
) => Array<VNode | string> | undefined;

export function raisintoSnabdom(
  node: RaisinDocumentNode,
  modifier: SnabdomRenderer = (d, n) => d,
  appender: SnabdomAppender = (c, n) => c
): VNode {
  const vnode = visit<VNode | string>(node, {
    onComment(c) {
      return h('!', c.data);
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
        appender(children, el)
      );
    },
    onText(text) {
      return text.data;
    },
    onRoot(root, children) {
      return h(GLOBAL_ENTRY, {}, appender(children, root));
    },
  });

  return vnode as VNode;
}
