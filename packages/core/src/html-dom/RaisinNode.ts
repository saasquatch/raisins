import { CssNodePlain } from 'css-tree';
import { ElementType } from 'domelementtype';

/**
 * This object will be used as the prototype for Nodes when creating a
 * DOM-Level-1-compliant structure.
 */
export interface RaisinNode<T extends ElementType = ElementType> {
  type: T;
  nodeType: number;
}
type DataNodesTypes = ElementType.Comment | ElementType.Text | ElementType.Directive;

export interface RaisinDataNode<T extends DataNodesTypes = DataNodesTypes> extends RaisinNode<T> {
  type: T;
  data: string;
}

export interface RaisinTextNode extends RaisinDataNode<ElementType.Text> {}
export interface RaisinCommentNode extends RaisinDataNode<ElementType.Comment> {}

export interface RaisinProcessingInstructionNode extends RaisinDataNode<ElementType.Directive> {
  'name': string;
  'x-name'?: string;
  'x-publicId'?: string;
  'x-systemId'?: string;
}

/**
 * A `Node` that can have children.
 */
export interface RaisinNodeWithChildren<T extends ElementType = ElementType> extends RaisinNode<T> {
  children: RaisinNode[];
}

export interface RaisinDocumentNode extends RaisinNodeWithChildren<ElementType.Root> {
  'x-mode'?: 'no-quirks' | 'quirks' | 'limited-quirks';
}

export interface RaisinStyleNode extends RaisinNode<ElementType.Style> {
  attribs: {
    [name: string]: string;
  };
  tagName: "style";
  contents?: CssNodePlain;
}

export interface RaisinElementNode extends RaisinNodeWithChildren<ElementType.Tag | ElementType.Script> {
  attribs: Omit<{
    [name: string]: string;
  }, "style">;
  style?: CssNodePlain;
  tagName: string;
}
