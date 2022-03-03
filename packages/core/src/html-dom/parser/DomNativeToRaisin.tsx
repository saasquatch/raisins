import { RaisinDocumentNode, RaisinNode } from "../RaisinNode";

export function domNativeToRaisin(document: Document): RaisinDocumentNode {
  const temp: RaisinDocumentNode = {
    type: "root",
    children: nodeListToRaisin(document.childNodes)
  };

  // TODO: add html dom conversion to raisinnode using browser parser
  return temp;
}

function nodeListToRaisin(nodes: NodeList): RaisinNode[] {
  return Array.from(nodes).map(nodeToRaisin);
}

function nodeToRaisin(node: Node): RaisinNode {
  switch (node.nodeType) {
    case Node.ELEMENT_NODE:
      const element = node as HTMLElement;

      if (element.nodeName === "TEMPLATE") {
        const template = element as HTMLTemplateElement;
        return {
          type: "tag",
          attribs: getAttribues(element),
          tagName: element.nodeName.toLowerCase(),
          children: nodeListToRaisin(template.content.childNodes)
        };
      }
      return {
        type: "tag",
        attribs: getAttribues(element),
        tagName: element.nodeName.toLowerCase(),
        children: nodeListToRaisin(element.childNodes)
      };
    case Node.TEXT_NODE:
      const textNode = node as Text;
      return {
        type: "text",
        // TODO: Should we convert null to empty string? Or not return a text node? Or change the raisin node interface?
        data: textNode.textContent ?? ""
      };
    case Node.COMMENT_NODE:
      const comment = node as Comment;
      return {
        type: "comment",
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
