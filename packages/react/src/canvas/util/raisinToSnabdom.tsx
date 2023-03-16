import {
  cssSerializer,
  htmlUtil,
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { h, VNode, VNodeData, fragment } from 'snabbdom';
import styleToObject from 'style-to-object';
import { RootRenderer } from '../types';
const { visit } = htmlUtil;

const GLOBAL_ENTRY = 'body';

/**
 * Modifies a Snabbdom node
 *
 * Useful for adding additional styling (e.g. selected styling) and props
 *
 */
export type SnabbdomRenderer = (
  d: VNodeData,
  n: RaisinElementNode
) => VNodeData;

export type SnabbdomAppender = (
  children: Array<VNode | string> | undefined,
  n: RaisinNodeWithChildren
) => Array<VNode | string> | undefined;

/**
 * Combines a set of {@link SnabbdomRenderer} into a single {@link SnabbdomRenderer}
 */
export function combineRenderers(
  ...renderers: SnabbdomRenderer[]
): SnabbdomRenderer {
  return (d, n) => {
    return renderers.reduce((previous, renderer) => renderer(previous, n), d);
  };
}

/**
 * Combines a set of {@link SnabbdomAppender} into a single {@link SnabbdomAppender}
 */
export function combineAppenders(
  ...appenders: SnabbdomAppender[]
): SnabbdomAppender {
  return (c, n) => {
    return appenders.reduce((previous, appender) => appender(previous, n), c);
  };
}

export function raisinToSnabbdom(
  node: RaisinDocumentNode,
  modifier: SnabbdomRenderer = (d, n) => d,
  appender: SnabbdomAppender = (c, n) => c,
  rootRenderer?: RootRenderer
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

      if (el.tagName === 'template') {
        return h(
          el.tagName,
          modifier(
            {
              attrs: el.attribs,
              style: styleObj,
              // Special handling here that works with the template module
              // inside of the iframe API. This fixes an issue where template
              // children are rendered as `template.childNodes` instead of
              // `template.content.childNodes`. To learn more, read the MDN
              // article on Document Fragments 
              // https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment
              templateContent: fragment(appender(children, el)),
            },
            el
          )
        );
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
      const newchildren = appender(children, root);
      if (rootRenderer) {
        const rootNode = rootRenderer(newchildren, root);
        return h(GLOBAL_ENTRY, {}, rootNode);
      }
      return h(GLOBAL_ENTRY, {}, newchildren);
    },
  });

  return vnode as VNode;
}
