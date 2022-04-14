import { inlineSchema as defaultSchema } from '../ProseSchemas';
import { htmlParser, htmlSerializer, RaisinNode } from '@raisins/core';
import { DOMParser, DOMSerializer, Node, Fragment } from 'prosemirror-model';
import { stringToNativeDom, nativeDomToString } from './nativeDom';

export type ProseRawNode = ProseRawDoc | ProseTextNode | ProseElementNode;

/**
 * Schema for a Raw prose doc.
 *
 * Obtained from `doc.toJSON()` https://prosemirror.net/docs/ref/#model.Node.toJSON
 */
export type ProseRawDoc = {
  type: 'doc';
  content?: (ProseTextNode | ProseElementNode)[];
};

export type ProseElementNode = {
  type: string;
  content?: ProseRawNode[];
};

export type ProseTextNode = {
  type: 'text';
  text: string;
  marks?: string[];
};

/**
 * Converts a RaisinNode to a Prose raw document (i.e. using `doc.toJSON()`)
 *
 * Not performant, since it serializes and deserializes via an HTML string
 */
export function raisinToProseDoc(
  node: RaisinNode,
  schema = defaultSchema
): ProseRawDoc {
  const content = htmlSerializer(node);
  const richDoc = DOMParser.fromSchema(schema).parse(
    stringToNativeDom(content)
  );
  const asJson = richDoc.toJSON();
  return asJson as ProseRawDoc;
}

export function proseFragmentToRaisin(
  doc: ProseRawDoc,
  schema = defaultSchema
): RaisinNode {
  const node = Fragment.fromJSON(schema, doc);
  return proseRichDocToRaisin(node, schema);
}

/**
 * Converts a Prose Fragment to a RaisinNode
 *
 * Not performant, since it serializes and deserializes via an HTML string
 */
export function proseRichDocToRaisin(node: Fragment, schema = defaultSchema) {
  const htmlElement = DOMSerializer.fromSchema(schema).serializeFragment(node);
  // converts via a trip to serialized HTML
  const htmlString = nativeDomToString(htmlElement);
  const raisinNode = htmlParser(htmlString);
  return raisinNode;
}
