import cssParser from "../css-om/parser";
import { COMMENT, DIRECTIVE, STYLE, TAG, TEXT } from "./domElementType";
import { ParseError, ParseErrorStack } from "./ParseError";
import { RaisinDocumentNode, RaisinNode } from "./RaisinNode";

export type DomNativeToRaisinOptions = {
  onParseError?: (error: ParseError, jsonPointer: string) => void;
};

export type DomNativeToRaisinResult = {
  node: RaisinDocumentNode;
  errors: ParseErrorStack;
};

/**
 * Parses a DOM (Document or Document Fragment) into a Raisin object
 *
 * @param Dom document or document fragment to be parsed
 * @param isHtml flag for removing html tag from the dom
 * @returns
 */
export function domNativeToRaisin(
  Dom: DocumentFragment | Document,
  isHtml: boolean = false,
  options: DomNativeToRaisinOptions = {}
): DomNativeToRaisinResult {
  const errors: ParseErrorStack = [];
  const report = (error: ParseError, jsonPointer: string) => {
    errors.push({ jsonPointer, error });
    options.onParseError?.(error, jsonPointer);
  };

  const node: RaisinDocumentNode = {
    type: "root",
    children: nodeListToRaisin(
      Dom.childNodes,
      isHtml && Dom instanceof Document,
      "",
      report
    )
  };
  return { node, errors };
}

function nodeListToRaisin(
  nodes: NodeList,
  isHtml: boolean,
  pointer: string,
  report: (error: ParseError, jsonPointer: string) => void
): RaisinNode[] {
  var nodesArray = Array.from(nodes);
  if (isHtml) {
    for (var i = 0; i < nodesArray.length; i++) {
      if (nodesArray[i].nodeName === "HTML") {
        nodesArray.splice(i, 1, ...Array.from(nodesArray[i].childNodes));
      }
    }
  }
  return nodesArray.map((n, idx) =>
    nodeToRaisin(n, `${pointer}/children/${idx}`, report)
  );
}

function nodeToRaisin(
  node: Node,
  pointer: string,
  report: (error: ParseError, jsonPointer: string) => void
): RaisinNode {
  switch (node.nodeType) {
    case Node.ELEMENT_NODE:
      const element = node as HTMLElement;
      const attribs = getAttribues(element);
      const { style, ...otherAttribs } = attribs;

      if (element.nodeName === "TEMPLATE") {
        const template = element as HTMLTemplateElement;
        return {
          type: TAG,
          attribs: getAttribues(element),
          tagName: element.nodeName.toLowerCase(),
          children: nodeListToRaisin(
            template.content.childNodes,
            false,
            pointer,
            report
          )
        };
      }
      if (element.nodeName === "STYLE") {
        const textContent = node.textContent;
        const styleNode: RaisinNode = {
          type: STYLE,
          tagName: "style",
          contents: undefined,
          attribs: getAttribues(element)
        };
        if (textContent) {
          styleNode.contents = cssParser(textContent, {
            onParseError: (error) =>
              report(
                {
                  rule: "css",
                  // @ts-ignore - @types/css-tree type is incomplete
                  message: `${error.message} at "${error.source}"`,
                },
                pointer
              )
          });
        }
        return styleNode;
      }
      const elementNode: RaisinNode = {
        type: TAG,
        attribs: { ...otherAttribs },
        tagName: element.nodeName.toLowerCase(),
        children: nodeListToRaisin(element.childNodes, false, pointer, report),
        style: undefined
      };
      if (style !== undefined) {
        elementNode.style = cssParser(style, {
          context: "declarationList",
          onParseError: (error) => {
            report(
              {
                rule: "css",
                // @ts-ignore - @types/css-tree type is incomplete
                message: `${error.message} at "${error.source}"`,
              },
              `${pointer}/attribs/style`
            )
        }});
      }
      return elementNode;
    case Node.TEXT_NODE:
      const textNode = node as Text;
      return {
        type: TEXT,
        // TODO: Should we convert null to empty string? Or not return a text node? Or change the raisin node interface?
        data: textNode.textContent ?? ""
      };
    case Node.COMMENT_NODE:
      const comment = node as Comment;
      return {
        type: COMMENT,
        // TODO: Should we convert null to empty string? Or not return a comment node? Or change the raisin node interface?
        data: comment.textContent ?? ""
      };
    case Node.DOCUMENT_TYPE_NODE:
      const documentNode = node as Document;
      return {
        type: DIRECTIVE,
        data: "!DOCTYPE " + documentNode.nodeName,
        name: "!doctype"
      };
    default:
      throw new Error("Unhandled node type " + node.nodeType);
  }
}

function getAttribues(element: HTMLElement): Record<string, string> {
  const names = element.getAttributeNames();

  return names.reduce((acc, key) => {
    const hasAttribute = element.hasAttribute(key);
    if (!hasAttribute) return acc;
    const value = element.getAttribute(key);
    return {
      ...acc,
      // At this point value should never be null, but we're including default just in case
      [key]: value ?? ""
    };
  }, {} as Record<string, string>);
}
