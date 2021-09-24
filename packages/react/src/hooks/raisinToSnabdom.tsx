import React from "react";
import { h, VNode, VNodeData } from 'snabbdom';
import { htmlUtil, RaisinNode, RaisinDocumentNode, cssSerializer } from '@raisins/core';
import styleToObject from "style-to-object";
const { visit } = htmlUtil;

const GLOBAL_ENTRY = 'body';

export function raisintoSnabdom(
  node: RaisinDocumentNode,
  modifier: (d: VNodeData, n:RaisinNode) => VNodeData = (d,n) => d
): VNode {
  const vnode = visit<VNode | string>(node, {
    onCData(c){
      return undefined
    },
    onComment(c){
      return undefined
    },
    onStyle(el) {
      return undefined;
    },
    onElement(el, children) {
      let styleObj;
      try {
        if(el.style){
          styleObj = styleToObject(cssSerializer(el.style));
        }
      } finally {
        styleObj = styleObj || {};
      }

      return h(el.tagName, modifier({ attrs: el.attribs, style:styleObj }, el), children);
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
