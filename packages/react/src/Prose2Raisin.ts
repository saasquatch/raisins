import { schema as defaultSchema } from 'prosemirror-schema-basic';
import { htmlParser, htmlSerializer, RaisinNode } from '@raisins/core';
import { DOMParser, DOMSerializer, Node, Fragment } from 'prosemirror-model';

export type ProseRawNode = ProseRawDoc | ProseTextNode | ProseElementNode;

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

export function proseRichDocToRaisin(node: Fragment, schema = defaultSchema) {
    const htmlElement = DOMSerializer.fromSchema(schema).serializeFragment(node)
    const htmlString = nativeDomToString(htmlElement);
    const raisinNode = htmlParser(htmlString);
    return raisinNode;
}

function nativeDomToString(node: any) {
  const tmpl = document.createElement('template');
  tmpl.content.appendChild(node);
  
  // Serializing happens here
  return tmpl.innerHTML;
}

/**
 * Parses a string into native DOM
 *
 * @param html
 * @returns
 */
function stringToNativeDom(html: string): DocumentFragment {
  const tmpl = document.createElement('template');

  // Parsing happens here
  tmpl.innerHTML = html;
  return tmpl.content;
}
