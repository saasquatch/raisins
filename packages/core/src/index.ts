/* istanbul ignore file */
import cssParser from "./css-om/parser";
import cssSerializer from "./css-om/serializer";
import { StyleNodeProps, StyleNodeWithChildren } from "./css-om/Types";
import * as cssUtil from "./css-om/util";
import { DefaultTextMarks } from "./html-dom/DefaultTextMarks";
import {
  isCommentNode,
  isDirectiveNode,
  isElementNode,
  isNodeWithChilden,
  isRoot,
  isStyleNode,
  isTextNode
} from "./html-dom/isNode";
import htmlParser from "./html-dom/parser";
import type {
  RaisinCommentNode,
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNode,
  RaisinNodeWithChildren,
  RaisinProcessingInstructionNode,
  RaisinStyleNode,
  RaisinTextNode
} from "./html-dom/RaisinNode";
import cssSelector from "./html-dom/selector";
import htmlSerializer from "./html-dom/serializer";
import * as htmlUtil from "./html-dom/util";
import { NodeVisitor as RaisinNodeVisitor } from "./html-dom/util";
import { getNode, getPath, NodePath, NodeSelection } from "./paths/Paths";
import { calculatePlopTargets } from "./validation/calculatePlopTargets";
import { getSlots } from "./validation/getSlots";
import * as HTMLComponents from "./validation/HTMLComponents";
import { doesChildAllowParent } from "./validation/rules/doesChildAllowParent";
import { doesParentAllowChild } from "./validation/rules/doesParentAllowChild";
import { isNodeAllowed } from "./validation/rules/isNodeAllowed";
import { NamedSlot, NodeWithSlots } from "./validation/SlotModel";
import { getSubErrors, hasSubErrors, removeError } from "./validation/validateNode/utils";
import {
  generateJsonPointers,
  validateAttributes, validateChildConstraints, validateNode
} from "./validation/validateNode/validateNode";

export {
  htmlSerializer,
  htmlParser,
  htmlUtil,
  cssSelector,
  // Node types
  isNodeWithChilden,
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
  cssUtil
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
  RaisinTextNode
};

