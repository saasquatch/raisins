import {
  doesChildAllowParent,
  doesParentAllowChild,
  isElementNode,
  isRoot,
  RaisinNode,
} from '@raisins/core';
import { CustomElement } from '@raisins/schema/schema';
import {
  ErrorEntry as BaseErrorEntry,
  ErrorStack as BaseErrorStack,
} from './types';

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
  const childConstraintErrors = validateChildContraints(node, meta);
  const attributeErrors = validateAttributes(node, meta);
  return [...childErrors, ...childConstraintErrors, ...attributeErrors];
}

function validateChildContraints(
  node: RaisinNode,
  meta: CustomElement[]
): ErrorStack {
  // No constraints apply when when node isn't an element node
  if (!isElementNode(node)) return [];

  const errorsOrUndefined = node.children.map((child, idx):
    | ErrorEntry
    | undefined => {
    if (isElementNode(child)) {
      const childMeta = meta.find((m) => m.tagName === child.tagName);
      const parentMeta = meta.find((m) => m.tagName === node.tagName);
      if (childMeta && !doesChildAllowParent(childMeta, node)) {
        return {
          jsonPointer: `/children/${idx}`,
          error: {
            rule: 'doesChildAllowParent',
          },
        };
      }
      if (
        parentMeta &&
        !doesParentAllowChild(child, parentMeta, child.attribs.slot)
      ) {
        return {
          jsonPointer: `/children/${idx}`,
          error: {
            rule: 'doesParentAllowChild',
          },
        };
      }
    }
    return undefined;
  });

  return errorsOrUndefined.filter(
    (x) => typeof x !== 'undefined'
  ) as ErrorStack;
}

function validateChildNodes(
  node: RaisinNode,
  meta: CustomElement[]
): ErrorStack {
  // No validation when node doesn't have children
  if (!(isElementNode(node) || isRoot(node))) return [];

  const childErrors = node.children
    .map((child, childIdx) =>
      validateNode(child, meta).map((error) => ({
        jsonPointer: `/children/${childIdx}${error.jsonPointer}`,
        error: error.error,
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
  path = '',
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

function validateAttributes(
  node: RaisinNode,
  meta: CustomElement[]
): ErrorStack {
  // Only validate attributes for element nodes
  if (!isElementNode(node)) return [];

  const nodeMeta = meta.find((m) => m.tagName === node.tagName);

  // TODO: Implement validation for attributes based on new schema properties
  return Object.keys(node.attribs)
    .filter((k) => k === 'class')
    .map((k) => {
      return {
        jsonPointer: '/attribs/' + k,
        error: {
          rule: 'attributes/classname',
        },
      };
    });
}
