import type { CustomElement } from "@raisins/schema";
import { isElementNode, isRoot } from "../../html-dom/isNode.ts";
import type { RaisinNode } from "../../html-dom/RaisinNode.ts";

/**
 * Given a tag's metadata, checks if it allows children.
 *
 * For inspiration, see how ProseMirror checks for allowed content: https://prosemirror.net/docs/guide/#schema.content_expressions
 *
 */
export function doesChildAllowParent(
  childMeta: CustomElement,
  parent: RaisinNode
): boolean {
  if (!isElementNode(parent) && !isRoot(parent)) {
    // Non-element nodes aren't picky. Text doesn't say where it can be, it's the other side of
    // the relationship that enforces this
    return true;
  }

  const tagName = isElementNode(parent) ? parent.tagName : undefined;

  if (childMeta.validParents === undefined) {
    // No constraints, so all parents are allowed.
    return true;
  }

  // TODO: Use CSS selectors engine or ProseMirror content engine
  if (
    (tagName !== undefined && childMeta.validParents.includes(tagName)) ||
    childMeta.validParents.includes("*")
  ) {
    // Child allows parent
    return true;
  }

  if (childMeta.validParents !== undefined && !tagName) {
    // Constraints, if a child specifies a set of valid parents,
    // then it will not allow it parent elements without tag names (e.g. comments)
    return false;
  }

  return false;
}
