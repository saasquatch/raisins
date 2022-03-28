import cssParser from "../../css-om/parser";
import { COMMENT, DIRECTIVE, STYLE, TAG, TEXT } from "./domElementType";
import { RaisinDocumentNode, RaisinNode } from "../RaisinNode";

/**
 * Parses a DOM (Document or Document Fragment) into a Raisin object
 * 
 * @param Dom document or document fragment to be parsed
 * @param isHtml flag for removing html tag from the dom 
 * @returns 
 */
export function domNativeToRaisin(
  Dom: DocumentFragment | Document,
  isHtml: boolean = false
): RaisinDocumentNode {
  const raisin: RaisinDocumentNode = {
    type: "root",
    children: nodeListToRaisin(
      Dom.childNodes,
      isHtml && Dom instanceof Document
    )
  };
  return raisin;
}

function nodeListToRaisin(
  nodes: NodeList,
  isHtml: boolean = false
): RaisinNode[] {
  var nodesArray = Array.from(nodes);
  if (isHtml) {
    for (var i = 0; i < nodesArray.length; i++) {
      if (nodesArray[i].nodeName === "HTML") {
        nodesArray.splice(i, 1, ...Array.from(nodesArray[i].childNodes));
      }
    }
  }
  return nodesArray.map(nodeToRaisin);
}

function nodeToRaisin(node: Node): RaisinNode {
  switch (node.nodeType) {
    case Node.ELEMENT_NODE:
      const element = node as HTMLElement;
      const attribs = getAttribues(element);
      const { style } = attribs;

      if (element.nodeName === "TEMPLATE") {
        const template = element as HTMLTemplateElement;
        return {
          type: TAG,
          attribs: getAttribues(element),
          tagName: element.nodeName.toLowerCase(),
          children: nodeListToRaisin(template.content.childNodes)
        };
      }
      if (element.nodeName === "STYLE") {
        const textContent = node.textContent;
        return {
          type: STYLE,
          tagName: "style",
          contents: textContent ? cssParser(textContent) : undefined,
          attribs: getAttribues(element)
        };
      }
      return {
        type: TAG,
        attribs: { ...attribs },
        tagName: element.nodeName.toLowerCase(),
        children: nodeListToRaisin(element.childNodes),
        style: style
          ? cssParser(style, { context: "declarationList" })
          : undefined
      };
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
