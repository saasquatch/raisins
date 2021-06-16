import { ElementType } from 'domelementtype';
import type * as DOMHandler from 'domhandler';
import cssParser from "../css-om/parser";

import type {
  RaisinCommentNode,
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNode,
  RaisinNodeWithChildren,
  RaisinProcessingInstructionNode,
  RaisinStyleNode,
  RaisinTextNode,
} from './RaisinNode';

/**
 * A depth-first visitor that will visit the deepest children first
 */
export interface DHNodeVisitor<T> {
  skipNode?(node: DOMHandler.Node): boolean;
  onText(text: DOMHandler.Text): T | undefined;
  onElement(element: DOMHandler.Element, children?: T[]): T | undefined;
  onStyle(element: DOMHandler.Element, children?: T[]): T | undefined;
  onRoot(node: DOMHandler.Document, children?: T[]): T | undefined;

  onDirective(directive: DOMHandler.ProcessingInstruction): T | undefined;
  onComment(comment: DOMHandler.Comment): T | undefined;
  onCData(element: DOMHandler.NodeWithChildren, children?: T[]): T | undefined;
}

export function domHandlerToRaisin(node: DOMHandler.Node): RaisinNode {
  return visit(node, {
    onText(text): RaisinTextNode {
      const { nodeType, data } = text;
      return { nodeType, type: ElementType.Text, data };
    },
    onStyle(element, children): RaisinStyleNode {
      const { type, attribs } = element;
      const textContent = children && children.filter(c=>c.type===ElementType.Text).map((c:RaisinTextNode)=>c.data).join("\n");
      return {
        tagName:"style",
        // @ts-ignore -- raisin has stronger types than DOMHandler
        type,
        contents: textContent && cssParser(textContent),
        attribs: { ...attribs },
      }
    },
    onElement(element, children): RaisinElementNode {
      const { tagName, type, attribs } = element;
      return {
        tagName,
        // @ts-ignore -- raisin has stronger types than
        type,
        children,
        attribs: { ...attribs },
      };
    },
    onRoot(node, children): RaisinDocumentNode {
      const { nodeType } = node;
      return {
        type: ElementType.Root,
        nodeType,
        children,
      };
    },
    onDirective(directive): RaisinProcessingInstructionNode {
      const { nodeType, data, name } = directive;
      return { nodeType, type: ElementType.Directive, data, name };
    },
    onComment(comment): RaisinCommentNode {
      const { nodeType, data } = comment;
      return { nodeType, type: ElementType.Comment, data };
    },
    onCData(element, children): RaisinNodeWithChildren {
      const { type, nodeType } = element;
      return {
        type,
        nodeType,
        children,
      };
    },
  });
}

export function visit<T>(node: DOMHandler.Node, visitor: DHNodeVisitor<T>, recursive: boolean = true): T {
  let result: T;
  const skip = visitor.skipNode && visitor.skipNode(node);
  if (skip) {
    return;
  }

  switch (node.type) {
    case ElementType.Text:
      result = visitor.onText && visitor.onText(node as DOMHandler.Text);
      break;
    case ElementType.Directive: {
      result = visitor.onDirective && visitor.onDirective(node as DOMHandler.ProcessingInstruction);
      break;
    }
    case ElementType.Comment:
      result = visitor.onComment && visitor.onComment(node as DOMHandler.Comment);
      break;
    case ElementType.Tag:
    case ElementType.Script: {
      if (!visitor.onElement) break;
      const element = node as DOMHandler.Element;
      const children = recursive && element.children ? element.children.map(c => visit(c, visitor, recursive)).filter(c => c !== undefined) : [];
      result = visitor.onElement(element, children);
      break;
    }
    case ElementType.Style: {
      if (!visitor.onStyle) break;
      const element = node as DOMHandler.Element;
      const children = recursive && element.children ? element.children.map(c => visit(c, visitor, recursive)).filter(c => c !== undefined) : [];
      result = visitor.onStyle(element, children);
      break;
    }
    case ElementType.CDATA: {
      if (!visitor.onCData) break;
      const cdata = node as DOMHandler.NodeWithChildren;
      const children = recursive && cdata.children ? cdata.children.map(c => visit(c, visitor, recursive)).filter(c => c !== undefined) : [];
      result = visitor.onCData(cdata, children);
      break;
    }
    case ElementType.Root: {
      if (!visitor.onRoot) break;
      const root = node as DOMHandler.Document;
      const children = recursive && root.children ? root.children.map(c => visit(c, visitor, recursive)).filter(c => c !== undefined) : [];
      result = visitor.onRoot(root, children);
      break;
    }
    case ElementType.Doctype: {
      // This type isn't used yet.
      throw new Error('Not implemented yet: ElementType.Doctype case');
    }
  }
  return result;
}
