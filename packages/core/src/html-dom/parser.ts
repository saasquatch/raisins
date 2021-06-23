import htmlparser2 from 'htmlparser2';
import { domHandlerToRaisin } from './DomHandlerToRaisin';
import type { RaisinDocumentNode } from './RaisinNode';
import { removeWhitespace } from './util';

/**
 * Parses HTML into a RaisinDocumentNode.
 * 
 * Internally uses `htmlparser2` and then converts the `dom-handler`
 * document returned into a frozen immutable RaisinDocumentNode.
 * 
 * Also cleans 
 * 
 * @param html an HTML string
 * @returns a parsed RaisinDocumentNode
 */
export function parse(html: string): RaisinDocumentNode {
  const DomNode = htmlparser2.parseDocument(html);
  const raisinNode = domHandlerToRaisin(DomNode) as RaisinDocumentNode;

  const clean = removeWhitespace(raisinNode);
  return clean as RaisinDocumentNode;
}

export default parse;