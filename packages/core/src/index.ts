import type {
  RaisinNode,
  RaisinDocumentNode,
  RaisinCommentNode,
  RaisinElementNode,
  RaisinNodeWithChildren,
  RaisinProcessingInstructionNode,
  RaisinStyleNode,
  RaisinTextNode,
} from "./html-dom/RaisinNode";

import htmlSerializer from "./html-dom/serializer";
import htmlParser from "./html-dom/parser";
import cssSelector from "./html-dom/selector";
import * as htmlUtil from "./html-dom/util";
import { NodeVisitor as RaisinNodeVisitor } from "./html-dom/util";

export { htmlSerializer, htmlParser, htmlUtil, RaisinNodeVisitor, cssSelector };

import { isNodeWithChilden, isElementNode, isRoot, isStyleNode, isTextNode, isCommentNode, isDirectiveNode } from "./html-dom/isNode";
export { isNodeWithChilden, isElementNode, isRoot, isStyleNode, isTextNode, isCommentNode, isDirectiveNode };

import cssSerializer from "./css-om/serializer";
import cssParser from "./css-om/parser";
import * as cssUtil from "./css-om/util";
import { StyleNodeProps, StyleNodeWithChildren } from "./css-om/Types";

import { NodePath, NodeSelection, getNode, getPath } from "./paths/Paths";

export type {
  NodePath,
  NodeSelection,
}

export {
  getNode,
  getPath
}

export {
  cssSerializer,
  cssParser,
  cssUtil,
  StyleNodeProps,
  StyleNodeWithChildren,
};

export type {
  RaisinNode,
  RaisinDocumentNode,
  RaisinCommentNode,
  RaisinElementNode,
  RaisinNodeWithChildren,
  RaisinProcessingInstructionNode,
  RaisinStyleNode,
  RaisinTextNode,
};
