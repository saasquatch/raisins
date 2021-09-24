import { parseDocument } from "htmlparser2";
import { domHandlerToRaisin } from "./DomHandlerToRaisin";
import type { RaisinDocumentNode } from "./RaisinNode";
import { removeWhitespace } from "./util";

type Options = {
  cleanWhitespace?: boolean
}
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
export function parse(html: string, {cleanWhitespace = true}:Options = {} ): RaisinDocumentNode {
  const DomNode = parseDocument(html);
  const raisinNode = domHandlerToRaisin(DomNode) as RaisinDocumentNode;

  const clean = cleanWhitespace ? removeWhitespace(raisinNode): raisinNode; 
  return clean as RaisinDocumentNode;
}

export default parse;
