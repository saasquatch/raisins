import { Attribute, CustomElement } from "@raisins/schema/schema";
import { parseToRgba } from "color2k";
import { Interval } from "luxon";
import { isElementNode, isRoot } from "../../html-dom/isNode";
import { RaisinNode } from "../../html-dom/RaisinNode";
import { doesChildAllowParent } from "../rules/doesChildAllowParent";
import { doesParentAllowChild } from "../rules/doesParentAllowChild";
import {
  ErrorEntry as BaseErrorEntry,
  ErrorStack as BaseErrorStack
} from "./types";

export type ErrorType =
  | {
      rule: "doesChildAllowParent" | "doesParentAllowChild";
      parent: RaisinNode;
      parentMeta?: CustomElement;
      child: RaisinNode;
      childMeta?: CustomElement;
    }
  | {
      rule:
        | "type/number"
        | "enum/number"
        | "maximum"
        | "minimum"
        | "required"
        | `enum/string`
        | `enum/number`
        | `enum/boolean`
        | "minLength"
        | "maxLength"
        | `format/color`
        | `format/date-interval`
        | `format/url`;
      attribute: Attribute;
    };

type ErrorEntry = BaseErrorEntry<ErrorType>;
type ErrorStack = BaseErrorStack<ErrorType>;

export function validateNode(
  node: RaisinNode,
  meta: CustomElement[]
): ErrorStack {
  const childErrors = validateChildNodes(node, meta);
  const childConstraintErrors = validateChildConstraints(node, meta);
  const attributeErrors = validateAttributes(node, meta);
  return [...childErrors, ...childConstraintErrors, ...attributeErrors];
}

export function validateChildConstraints(
  node: RaisinNode,
  meta: CustomElement[]
): ErrorStack {
  // No constraints apply when when node isn't an element node
  if (!isElementNode(node)) return [];

  const errorsOrUndefined = node.children.map((child, idx):
    | ErrorEntry
    | undefined => {
    if (isElementNode(child)) {
      const childMeta = meta.find(m => m.tagName === child.tagName);
      const parentMeta = meta.find(m => m.tagName === node.tagName);

      if (childMeta && !doesChildAllowParent(childMeta, node)) {
        return {
          jsonPointer: `/children/${idx}`,
          error: {
            rule: "doesChildAllowParent",
            parent: node,
            parentMeta,
            child,
            childMeta
          }
        };
      }
      if (
        parentMeta &&
        !doesParentAllowChild(child, parentMeta, child.attribs.slot)
      ) {
        return {
          jsonPointer: `/children/${idx}`,
          error: {
            rule: "doesParentAllowChild",
            parent: node,
            parentMeta,
            child,
            childMeta
          }
        };
      }
    }
    return undefined;
  });

  return errorsOrUndefined.filter(x => typeof x !== "undefined") as ErrorStack;
}

function validateChildNodes(
  node: RaisinNode,
  meta: CustomElement[]
): ErrorStack {
  // No validation when node doesn't have children
  if (!(isElementNode(node) || isRoot(node))) return [];

  const childErrors = node.children
    .map((child, childIdx) =>
      validateNode(child, meta).map(error => ({
        jsonPointer: `/children/${childIdx}${error.jsonPointer}`,
        error: error.error
      }))
    )
    .reduce((acc, curr) => [...acc, ...curr], []);
  return childErrors;
}

/**
 * Generate a set of JSON Paths for all descendents of a {@link RaisinNode}
 */
export function generateJsonPointers(
  node: RaisinNode,
  path = "",
  map = new WeakMap()
): WeakMap<RaisinNode, string> {
  map.set(node, path);
  if (isElementNode(node) || isRoot(node)) {
    return node.children.reduce(
      (acc, c, idx) => generateJsonPointers(c, `${path}/children/${idx}`, acc),
      map
    );
  }
  return map;
}

export function validateAttributes(
  node: RaisinNode,
  meta: CustomElement[]
): ErrorStack {
  // Only validate attributes for element nodes
  if (!isElementNode(node)) return [];

  const nodeMeta = meta.find(m => m.tagName === node.tagName);

  // If meta for node or the attributes do not exist then validation cannot be done
  if (nodeMeta === undefined || nodeMeta.attributes === undefined) return [];

  const errorStack: ErrorEntry[] = [];

  // For each attribute, check validation rules
  nodeMeta.attributes.forEach(a => {
    // check if attribute exists on the node
    if (node.attribs[a.name] === undefined) {
      if (a.required === true && a.type !== "boolean")
        errorStack.push({
          jsonPointer: "/attribs/" + a.name,
          error: {
            rule: "required",
            attribute: a
          }
        });
      // skip validation if does not exist and not required
      return;
    }

    // cannot apply rules if no type is set, skip
    if (a.type === undefined) return;

    const value = node.attribs[a.name];

    switch (a.type) {
      case "number":
        if (isNaN(Number(value)) || value === "")
          errorStack.push({
            jsonPointer: "/attribs/" + a.name,
            error: {
              rule: `type/number`,
              attribute: a
            }
          });
        if (a.enum !== undefined && !a.enum.includes(Number(value)))
          errorStack.push({
            jsonPointer: "/attribs/" + a.name,
            error: {
              rule: `enum/number`,
              attribute: a
            }
          });
        if (a.maximum !== undefined && Number(value) > Number(a.maximum))
          errorStack.push({
            jsonPointer: "/attribs/" + a.name,
            error: {
              rule: `maximum`,
              attribute: a
            }
          });
        if (a.minimum !== undefined && Number(value) < Number(a.minimum))
          errorStack.push({
            jsonPointer: "/attribs/" + a.name,
            error: {
              rule: `minimum`,
              attribute: a
            }
          });
        break;
      case "string":
        if (a.enum !== undefined && !a.enum.includes(value))
          errorStack.push({
            jsonPointer: "/attribs/" + a.name,
            error: {
              rule: `enum/string`,
              attribute: a
            }
          });
        if (a.maxLength !== undefined && value.length > Number(a.maxLength))
          errorStack.push({
            jsonPointer: "/attribs/" + a.name,
            error: {
              rule: `maxLength`,
              attribute: a
            }
          });
        if (a.minLength !== undefined && value.length < Number(a.minLength))
          errorStack.push({
            jsonPointer: "/attribs/" + a.name,
            error: {
              rule: `minLength`,
              attribute: a
            }
          });
        if (a.format !== undefined) {
          switch (a.format) {
            case "color":
              if (isValidColor(value) === false)
                errorStack.push({
                  jsonPointer: "/attribs/" + a.name,
                  error: {
                    rule: `format/color`,
                    attribute: a
                  }
                });
              break;
            case "date-interval":
              if (isValidDateInterval(value) === false)
                errorStack.push({
                  jsonPointer: "/attribs/" + a.name,
                  error: {
                    rule: `format/date-interval`,
                    attribute: a
                  }
                });
              break;
            case "url":
              if (isValidURL(value) === false)
                errorStack.push({
                  jsonPointer: "/attribs/" + a.name,
                  error: {
                    rule: `format/url`,
                    attribute: a
                  }
                });
              break;
          }
        }
        break;
      case "boolean":
        if (a.enum !== undefined && !a.enum.includes(value))
          errorStack.push({
            jsonPointer: "/attribs/" + a.name,
            error: {
              rule: `enum/boolean`,
              attribute: a
            }
          });
        break;
    }
  });

  return errorStack as ErrorStack;
}

export function isValidColor(value: string): boolean {
  if (value === "currentColor" || value === "currentcolor") return true;
  if (/var\(--sl-color-.*\)/.test(value)) return true;
  try {
    parseToRgba(value);
  } catch {
    return false;
  }
  return true;
}

export function isValidURL(value: string): boolean {
  var url;
  if (value.startsWith("//")) value = "https:" + value;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

export function isValidDateInterval(value: string): boolean {
  return Interval.fromISO(value).isValid;
}
