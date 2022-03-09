import { parseDocument } from "htmlparser2";
import { domHandlerToRaisin } from "./parser/DomHandlerToRaisin";
import { documentFragmentToRaisin } from "./parser/DomNativeToRaisin";
import { RaisinDocumentNode } from "./RaisinNode";
import { removeWhitespace } from "./util";

type Options = {
  cleanWhitespace?: boolean;
  domParser?: boolean;
};

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
export function parse(
  html: string,
  { cleanWhitespace = false, domParser = false }: Options = {}
): RaisinDocumentNode {
  const raisinNode = domParser
    ? parseWithTemplateTag(html)
    : parseWithHtmlParser2(html);
  const clean = cleanWhitespace ? removeWhitespace(raisinNode) : raisinNode;
  return clean as RaisinDocumentNode;
}

function parseWithHtmlParser2(html: string) {
  const DomNode = parseDocument(html);
  return domHandlerToRaisin(DomNode) as RaisinDocumentNode;
}

/**
 * remarkablemark, (2022) html-dom-parser [Source code]: https://github.com/remarkablemark/html-dom-parser/blob/master/lib/client/domparser.js
 *
 * Template (performance: fast).
 *
 * @see https://developer.mozilla.org/docs/Web/HTML/Element/template
 */
const template = document.createElement("template");
function parseWithTemplateTag(html: string) {
  template.innerHTML = html;
  const Dom = template.content;
  return documentFragmentToRaisin(Dom) as RaisinDocumentNode;
}

export default parse;
