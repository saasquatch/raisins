import { CustomElement } from "@raisins/schema/schema";
import { isElementNode, isRoot } from "../../html-dom/isNode";
import { RaisinNode } from "../../html-dom/RaisinNode";
import { doesChildAllowParent } from "../rules/doesChildAllowParent";
import { doesParentAllowChild } from "../rules/doesParentAllowChild";
import {
  ErrorEntry as BaseErrorEntry,
  ErrorStack as BaseErrorStack
} from "./types";
import { parseToRgba } from "color2k";

type ErrorType = {
  /**
   * Machine-readable rule name
   */
  rule: string;
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
            rule: "doesChildAllowParent"
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
            rule: "doesParentAllowChild"
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
      // log error if attribute is required and does not exist
      if (a.required === true)
        errorStack.push({
          jsonPointer: "/attribs/" + a.name,
          error: {
            rule: "required"
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
        if (isNaN(Number(value)))
          errorStack.push({
            jsonPointer: "/attribs/" + a.name,
            error: {
              rule: `type`
            }
          });
        if (a.enum !== undefined && !a.enum.includes(value))
          errorStack.push({
            jsonPointer: "/attribs/" + a.name,
            error: {
              rule: `enum`
            }
          });
        if (a.maximum !== undefined && Number(value) > Number(a.maximum))
          errorStack.push({
            jsonPointer: "/attribs/" + a.name,
            error: {
              rule: `maximum`
            }
          });
        if (a.minimum !== undefined && Number(value) < Number(a.minimum))
          errorStack.push({
            jsonPointer: "/attribs/" + a.name,
            error: {
              rule: `minimum`
            }
          });
        break;
      case "string":
        // value is always a string so no type check necessary
        if (a.enum !== undefined && !a.enum.includes(value))
          errorStack.push({
            jsonPointer: "/attribs/" + a.name,
            error: {
              rule: `enum`
            }
          });
        if (a.maxLength !== undefined && value.length > Number(a.maxLength))
          errorStack.push({
            jsonPointer: "/attribs/" + a.name,
            error: {
              rule: `maxLength`
            }
          });
        if (a.minLength !== undefined && value.length < Number(a.minLength))
          errorStack.push({
            jsonPointer: "/attribs/" + a.name,
            error: {
              rule: `minLength`
            }
          });
        if (a.format !== undefined) {
          switch (a.format) {
            case "color":
              if (isValidColor(value) === false)
                errorStack.push({
                  jsonPointer: "/attribs/" + a.name,
                  error: {
                    rule: `format-color`
                  }
                });
              break;
            case "date-time":
              break;

            case "url":
              break;

            default:
              errorStack.push({
                jsonPointer: "/attribs/" + a.name,
                error: {
                  rule: `format-unsupported`
                }
              });
          }
        }
        break;
      case "boolean":
        if (!(value === "true" || value === "false"))
          errorStack.push({
            jsonPointer: "/attribs/" + a.name,
            error: {
              rule: `type`
            }
          });
        // unnecessary to check for if in enum list or max/min length
        break;
    }
  });

  return errorStack as ErrorStack;
}

function isValidColor(input: string): boolean {
  try {
    parseToRgba(input);
  } catch {
    return false;
  }
  return true;
}
