import { parseDocument } from "htmlparser2";
import { domHandlerToRaisin } from "./DomHandlerToRaisin";
import { domNativeToRaisin } from "./parser/DomNativeToRaisin";
import { RaisinDocumentNode } from "./RaisinNode";
import { removeWhitespace } from "./util";

type DOMParserSupportedType =
  | "application/xhtml+xml"
  | "application/xml"
  | "image/svg+xml"
  | "text/html"
  | "text/xml";

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
  { cleanWhitespace = true, domParser = false }: Options = {}
): RaisinDocumentNode {
  const raisinNode = domParser ? parseDomNative(html) : parseDomHandler(html);
  const clean = cleanWhitespace ? removeWhitespace(raisinNode) : raisinNode;
  return clean as RaisinDocumentNode;
}

export default parse;

function parseDomHandler(html: string) {
  const DomNode = parseDocument(html);
  return domHandlerToRaisin(DomNode) as RaisinDocumentNode;
}

function parseDomNative(html: string) {
  const parser = new DOMParser();
  var mimeType: DOMParserSupportedType = "text/html";
  if (
    html.startsWith("<!DOCTYPE") ||
    (html.startsWith("<!--") && html.endsWith("-->")) ||
    (html.startsWith("<?") && html.endsWith("?>"))
  ) {
    html = html + "<d3l3t3></d3l3t3>";
    mimeType = "text/xml";
  }
  if (!(html.startsWith("<") && html.endsWith(">"))) {
    html = "<t3xt>html</t3xt>";
    mimeType = "text/xml";
  }
  if (
    html.includes("</style>") ||
    html.includes("</template>") ||
    html.includes("?>") ||
    html.includes("-->")
  ) {
    mimeType = "text/xml";
  }
  const document = parser.parseFromString(html, mimeType);
  // TODO: parsing using template tags?
  return domNativeToRaisin(
    document,
    mimeType === "text/html"
  ) as RaisinDocumentNode;
}
