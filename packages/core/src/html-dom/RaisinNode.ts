import { CssNodePlain } from "css-tree";
import {
  Comment,
  Directive,
  Root,
  Style,
  Tag,
  Text
} from "./parser/domElementType";

/**
 * The base used as the prototype for Nodes
 */
export type RaisinNode =
  | RaisinTextNode
  | RaisinCommentNode
  | RaisinProcessingInstructionNode
  | RaisinDocumentNode
  | RaisinStyleNode
  | RaisinElementNode;

export type RaisinNodeType = RaisinNode["type"];

interface RaisinDataNode<T> {
  type: T;
  data: string;
}

export interface RaisinTextNode extends RaisinDataNode<Text> {}
export interface RaisinCommentNode extends RaisinDataNode<Comment> {}

export interface RaisinProcessingInstructionNode {
  type: Directive;
  name: string;
  data: string;
}

/**
 * A `Node` that can have children.
 */
export type RaisinNodeWithChildren = RaisinElementNode | RaisinDocumentNode;

export interface RaisinDocumentNode {
  type: Root;
  children: RaisinNode[];
}

export interface RaisinStyleNode {
  type: Style;
  attribs: {
    [name: string]: string;
  };
  tagName: "style";
  contents?: CssNodePlain;
}

export interface RaisinElementNode {
  type: Tag;
  attribs: Omit<
    {
      [name: string]: string;
    },
    "style"
  >;
  style?: CssNodePlain;
  tagName: string;
  children: RaisinNode[];
}
