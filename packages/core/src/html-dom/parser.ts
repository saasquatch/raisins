import { domNativeToRaisin } from "./DomNativeToRaisin";
import { ParseError, ParseErrorStack } from "./ParseError";
import { RaisinDocumentNode } from "./RaisinNode";
import { removeWhitespace } from "./util";

type Options = {
  cleanWhitespace?: boolean;
  onParseError?: (error: ParseError, jsonPointer: string) => void;
};

/**
 * Parses HTML into a RaisinDocumentNode.
 *
 * @param html an HTML string
 * @returns a parsed RaisinDocumentNode
 */
export default function parse(
  html: string,
  options: Options = {},
): RaisinDocumentNode {
  return parseWithErrors(html, options).node;
}

/**
 * Parses HTML into a RaisinDocumentNode along with any parse errors
 * encountered (e.g. malformed CSS in `style` attributes or `<style>` tags).
 *
 * Note: jsonPointers in returned errors reference the pre-cleanWhitespace tree.
 */
export function parseWithErrors(
  html: string,
  { cleanWhitespace = false, onParseError }: Options = {},
): { node: RaisinDocumentNode; errors: ParseErrorStack } {
  const { node, errors } = parseDomParser(html, onParseError);
  const clean = cleanWhitespace
    ? (removeWhitespace(node) as RaisinDocumentNode)
    : node;
  return { node: clean, errors };
}

/**
 * DOM Parser using template tags
 *
 * @see https://developer.mozilla.org/docs/Web/HTML/Element/template
 *
 * @param html string to be parsed
 * @returns
 */
function parseDomParser(
  html: string,
  onParseError?: (error: ParseError, jsonPointer: string) => void,
) {
  const isDoctype = /<!doctype[\s/>]/i.test(html);
  const isHtml = /<\/?html[\s/>]/i.test(html);
  const isHead = /<\/?head[\s/>]/i.test(html);
  const isBody = /<\/?body[\s/>]/i.test(html);

  // removes any excess new line characters after a closing <html> tag
  html = html.replace(/<\/html>\n*/g, `</html>`);

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

    return domNativeToRaisin(dom, !isHtml, { onParseError });
  }

  const template = document.createElement("template");
  template.innerHTML = html;
  const documentFragment = template.content;
  return domNativeToRaisin(documentFragment, false, { onParseError });
}
