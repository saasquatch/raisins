/**
 * Gets the inner HTML from a browser node.
 *
 * @param node - a browser node
 * @returns
 */
export function nativeDomToString(node: Node) {
  const tmpl = document.createElement('template');
  const clone = node.cloneNode(true);
  tmpl.content.appendChild(clone);

  // Serializing happens here
  return tmpl.innerHTML;
}

/**
 * Parses a string into native DOM. This should work for document fragments, but not entire documents.
 *
 * @param html
 * @returns
 */
export function stringToNativeDom(html: string): DocumentFragment {
  const tmpl = document.createElement('template');

  // Parsing happens here
  tmpl.innerHTML = html;
  return tmpl.content;
}
