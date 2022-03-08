import cssParser from "../../css-om/parser";
import { COMMENT, DIRECTIVE, STYLE, TAG, TEXT } from "../domElementType";
import { RaisinDocumentNode, RaisinNode } from "../RaisinNode";

export function domNativeToRaisin(
  document: Document,
  body?: boolean
): RaisinDocumentNode {
  const raisin: RaisinDocumentNode = {
    type: "root",
    children: body
      ? nodeListToRaisin(document.body.childNodes)
      : nodeListToRaisin(document.childNodes)
  };
  return raisin;
}

function nodeListToRaisin(nodes: NodeList): RaisinNode[] {
  var nodesArray = Array.from(nodes);
  nodesArray.forEach((x, i) => {
    if (x.nodeName === "d3l3t3") nodesArray.splice(i, 1);
    if (x.nodeName === "t3xt") nodesArray[i] = nodesArray[i].childNodes[0];
  });
  return nodesArray.map(nodeToRaisin);
}

function nodeToRaisin(node: Node): RaisinNode {
  switch (node.nodeType) {
    case Node.ELEMENT_NODE:
      const element = node as HTMLElement;
      const attribs = getAttribues(element);
      const { style, ...otherAttribs } = attribs;

      if (element.nodeName === "template") {
        const template = element as HTMLTemplateElement;
        return {
          type: TAG,
          attribs: getAttribues(element),
          tagName: element.nodeName.toLowerCase(),
          children: nodeListToRaisin(template.content.childNodes)
        };
      }
      if (element.nodeName === "style") {
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
        attribs: { ...otherAttribs },
        tagName: element.nodeName.toLowerCase(),
        children: nodeListToRaisin(element.childNodes),
        style: style
          ? cssParser(style, { context: "declarationList" })
          : undefined
      };
    case Node.DOCUMENT_TYPE_NODE:
      const docType = node as DocumentType;
      return {
        type: DIRECTIVE,
        name: "!doctype",
        data: "!DOCTYPE " + docType.nodeName
      };
    case Node.PROCESSING_INSTRUCTION_NODE:
      const proNode = node as ProcessingInstruction;
      return {
        type: DIRECTIVE,
        name: "?" + proNode.nodeName,
        data: `?${proNode.nodeName} ${proNode.nodeValue}?`
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
    case Node.DOCUMENT_NODE:
      const doc = node as Document;
      return domNativeToRaisin(doc);
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
