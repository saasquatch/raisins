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

export interface DataNode<T extends DataNodesTypes = DataNodesTypes> extends RaisinNode<T> {
  type: T;
  data: string;
  /**
   * @param type The type of the node
   * @param data The content of the data node
   */
  nodeValue: string;
}

export interface RaisinTextNode extends DataNode<ElementType.Text> {}
export interface RaisinCommentNode extends DataNode<ElementType.Comment> {}

export interface RaisinProcessingInstructionNode extends DataNode<ElementType.Directive> {
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

export interface Attribute {
  name: string;
  value: string;
  namespace?: string;
  prefix?: string;
}

export interface RaisinElementNode extends RaisinNodeWithChildren<ElementType.Tag | ElementType.Script | ElementType.Style> {
  'name': string;
  'attribs': {
    [name: string]: string;
  };
  'tagName': string;
  'attributes': Attribute[];
  'x-attribsNamespace'?: Record<string, string>;
  'x-attribsPrefix'?: Record<string, string>;
}
