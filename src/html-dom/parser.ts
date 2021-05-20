import { domHandlerToRaisin } from './DomHandlerToRaisin';
import { RaisinDocumentNode } from './RaisinNode';
import htmlparser2 from 'htmlparser2';
import { removeWhitespace } from '../util';

export function parse(html: string): RaisinDocumentNode {
  const DomNode = htmlparser2.parseDocument(html);
  const raisinNode = domHandlerToRaisin(DomNode) as RaisinDocumentNode;

  const clean = removeWhitespace(raisinNode);
  return clean as RaisinDocumentNode;
}
