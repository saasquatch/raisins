/* istanbul ignore file */
import cssParser from "./css-om/parser.ts";
import { scopeStylesheet } from "./css-om/scope.ts";
import cssSerializer from "./css-om/serializer.ts";
import type { StyleNodeProps, StyleNodeWithChildren } from "./css-om/Types.ts";
import * as cssUtil from "./css-om/util.ts";
import { DefaultTextMarks } from "./html-dom/DefaultTextMarks.ts";
import {
  isCommentNode,
  isDirectiveNode,
  isElementNode,
  isNodeWithChildren,
  isRoot,
  isStyleNode,
  isTextNode
} from "./html-dom/isNode.ts";
import htmlParser, { parseWithErrors } from "./html-dom/parser.ts";
// eslint-disable-next-line prettier/prettier
import type {
  CssParseError,
  ParseError,
  ParseErrorEntry,
  ParseErrorStack
} from "./html-dom/ParseError.ts";
// eslint-disable-next-line prettier/prettier
import type {
  RaisinCommentNode,
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNode,
  RaisinNodeWithChildren,
  RaisinProcessingInstructionNode,
  RaisinStyleNode,
  RaisinTextNode
} from "./html-dom/RaisinNode.ts";
import cssSelector from "./html-dom/selector.ts";
import htmlSerializer from "./html-dom/serializer.ts";
import * as htmlUtil from "./html-dom/util.ts";
import type { NodeVisitor as RaisinNodeVisitor } from "./html-dom/util.ts";
import { getNode, getPath, type NodePath, type NodeSelection } from "./paths/Paths.ts";
import { calculatePlopTargets } from "./validation/calculatePlopTargets.ts";
import { getSlots } from "./validation/getSlots.ts";
import * as HTMLComponents from "./validation/HTMLComponents.ts";
import { doesChildAllowParent } from "./validation/rules/doesChildAllowParent.ts";
import { doesParentAllowChild } from "./validation/rules/doesParentAllowChild.ts";
import { isNodeAllowed } from "./validation/rules/isNodeAllowed.ts";
import type { NamedSlot, NodeWithSlots } from "./validation/SlotModel.ts";
import { getSubErrors, hasSubErrors, removeError } from "./validation/validateNode/utils.ts";
import {
  generateJsonPointers,
  validateAttributes, validateChildConstraints, validateNode
} from "./validation/validateNode/validateNode.ts";

export {
  htmlSerializer,
  htmlParser,
  parseWithErrors,
  htmlUtil,
  // Node types
  isNodeWithChildren,
  isElementNode,
  isRoot,
  isStyleNode,
  isTextNode,
  isCommentNode,
  isDirectiveNode,
  // Validation
  getSlots,
  doesChildAllowParent,
  doesParentAllowChild,
  isNodeAllowed,
  HTMLComponents,
  DefaultTextMarks,
  validateNode,
  validateChildConstraints,
  generateJsonPointers,
  validateAttributes,
  getSubErrors,
  hasSubErrors,
  removeError,
  calculatePlopTargets,
  // Path / selection
  getNode,
  getPath,
  // CSS
  cssSerializer,
  cssParser,
  cssSelector,
  cssUtil,
  scopeStylesheet
};
export type {
  RaisinNodeVisitor,
  // Validation
  NodeWithSlots,
  NamedSlot,
  // Path / selection
  NodePath,
  NodeSelection,
  // CSS
  StyleNodeProps,
  StyleNodeWithChildren,
  // Node
  RaisinNode,
  RaisinDocumentNode,
  RaisinCommentNode,
  RaisinElementNode,
  RaisinNodeWithChildren,
  RaisinProcessingInstructionNode,
  RaisinStyleNode,
  RaisinTextNode,
  // Parse errors
  ParseError,
  CssParseError,
  ParseErrorEntry,
  ParseErrorStack
};
