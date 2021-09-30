import type * as DOMHandler from "domhandler";
import { ElementType } from "htmlparser2";
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
} from "./RaisinNode";

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
  const raisin = visit<RaisinNode>(node, {
    onText(text): RaisinTextNode {
      const { data } = text;
      return { type: ElementType.Text, data };
    },
    onStyle(element, children): RaisinStyleNode {
      const { type, attribs } = element;
      const textContent =
        children &&
        children
          .filter((c) => c && c.type === ElementType.Text)
          .map((c) => (c as RaisinTextNode)?.data)
          .join("\n");
      return {
        tagName: "style",
        // @ts-ignore -- raisin has stronger types than DOMHandler
        type,
        contents: textContent ? cssParser(textContent) : undefined,
        attribs: { ...attribs },
      };
    },
    onElement(element, children): RaisinElementNode {
      const { tagName, type, attribs } = element;
      const { style, ...otherAttribs } = attribs;
      return {
        tagName,
        // @ts-ignore -- raisin has stronger types than
        type,
        children: children ?? [],
        attribs: { ...otherAttribs },
        style: style ? cssParser(style, { context: "declarationList" }) : undefined,
      };
    },
    onRoot(_, children): RaisinDocumentNode {
      return {
        type: ElementType.Root,
        children: children ?? [],
      };
    },
    onDirective(directive): RaisinProcessingInstructionNode {
      const { data, name } = directive;
      return { type: ElementType.Directive, data, name };
    },
    onComment(comment): RaisinCommentNode {
      const { data } = comment;
      return { type: ElementType.Comment, data };
    },
    onCData(element, children): RaisinNodeWithChildren {
      const { type } = element;
      return {
        type,
        children: children ?? [],
      };
    },
  });
  // we know it's not undefined
  return raisin!;
}

export function visit<T>(
  node: DOMHandler.Node,
  visitor: DHNodeVisitor<T>,
  recursive: boolean = true
): T | undefined {
  let result: T | undefined;
  const skip = visitor.skipNode && visitor.skipNode(node);
  if (skip) {
    return;
  }

  switch (node.type) {
    case ElementType.Text:
      result = visitor.onText && visitor.onText(node as DOMHandler.Text);
      break;
    case ElementType.Directive: {
      result =
        visitor.onDirective &&
        visitor.onDirective(node as DOMHandler.ProcessingInstruction);
      break;
    }
    case ElementType.Comment:
      result =
        visitor.onComment && visitor.onComment(node as DOMHandler.Comment);
      break;
    case ElementType.Tag:
    case ElementType.Script: {
      if (!visitor.onElement) break;
      const element = node as DOMHandler.Element;
      const children =
        recursive && element.children
          ? element.children
              .map((c) => visit(c, visitor, recursive))
              .filter((c) => c !== undefined) as T[]
          : [];
      result = visitor.onElement(element, children);
      break;
    }
    case ElementType.Style: {
      if (!visitor.onStyle) break;
      const element = node as DOMHandler.Element;
      const children =
        recursive && element.children
          ? element.children
              .map((c) => visit(c, visitor, recursive))
              .filter((c) => c !== undefined) as T[]
          : [];
      result = visitor.onStyle(element, children);
      break;
    }
    case ElementType.CDATA: {
      if (!visitor.onCData) break;
      const cdata = node as DOMHandler.NodeWithChildren;
      const children =
        recursive && cdata.children
          ? cdata.children
              .map((c) => visit(c, visitor, recursive))
              .filter((c) => c !== undefined) as T[]
          : [];
      result = visitor.onCData(cdata, children);
      break;
    }
    case ElementType.Root: {
      if (!visitor.onRoot) break;
      const root = node as DOMHandler.Document;
      const children =
        recursive && root.children
          ? root.children
              .map((c) => visit(c, visitor, recursive))
              .filter((c) => c !== undefined) as T[]
          : [];
      result = visitor.onRoot(root, children);
      break;
    }
    case ElementType.Doctype: {
      // This type isn't used yet.
      throw new Error("Not implemented yet: ElementType.Doctype case");
    }
  }
  return result;
}
