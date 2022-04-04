import { domNativeToRaisin } from "./parser/DomNativeToRaisin";
import { RaisinDocumentNode } from "./RaisinNode";
import { removeWhitespace } from "./util";

type Options = {
  cleanWhitespace?: boolean;
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
  { cleanWhitespace = false }: Options = {}
): RaisinDocumentNode {
  const raisinNode = parseDomParser(html);
  const clean = cleanWhitespace ? removeWhitespace(raisinNode) : raisinNode;
  return clean as RaisinDocumentNode;
}

/**
 * DOM Parser using template tags
 *
 * @see https://developer.mozilla.org/docs/Web/HTML/Element/template
 *
 * @param html string to be parsed
 * @returns
 */
function parseDomParser(html: string) {
  const isDoctype = /<!doctype.*?>/is.test(html);
  const isHtml = /<\/?html.*?>/is.test(html);
  const isHead = /<\/?head.*?>/is.test(html);
  const isBody = /<\/?body.*?>/is.test(html);

  // removes any excess new line characters after a closing <html> tag
  html = html.replace(/(?<=<\/html>)\n*/g, "");

  if (isDoctype || isHtml || isHead || isBody) {
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, "text/html");

    if (!isBody) {
      const body = dom.getElementsByTagName("body")[0];
      body.replaceWith(...Array.from(body.childNodes));
    }

    if (!isHead) {
      const head = dom.getElementsByTagName("head")[0];
      head.replaceWith(...Array.from(head.childNodes));
    }

    return domNativeToRaisin(dom, !isHtml) as RaisinDocumentNode;
  }

  const template = document.createElement("template");
  template.innerHTML = html;
  const documentFragment = template.content;
  return domNativeToRaisin(documentFragment) as RaisinDocumentNode;
}

export default parse;
