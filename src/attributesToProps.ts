import { VNodeData } from "@stencil/core";
import styleToObject from "style-to-object";

/**
 * Converts attributes from a DOM `NamedNodeMap` to a stencil-compatible props objects
 * 
 * @param attributes a `NamedNodeMap` from the DOM, see: https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap
 */
export function attributesToProps(attributes?: NamedNodeMap): VNodeData {
  if (!attributes) {
    return {};
  }

  const { style, ...rest } = formatAttributes(attributes);
  return {
    style: styleToObject(style),
    ...rest,
  };
}


/**
 * Formats DOM attributes to a hash map.
 *
 * @param  {NamedNodeMap} attributes - List of attributes.
 * @return {Record<string, string>} - Map of attribute name to value.
 */
export function formatAttributes(
  attributes: NamedNodeMap
): Record<string, string> {
  let result: Record<string, string> = {};
  // `NamedNodeMap` is array-like
  for (let i = 0, len = attributes.length; i < len; i++) {
    const attribute = attributes[i];
    result[attribute.name] = attribute.value;
  }
  return result;
}