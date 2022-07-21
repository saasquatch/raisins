import { CustomElement } from "@raisins/schema/schema";
import { isElementNode, isRoot } from "../../html-dom/isNode";
import { RaisinElementNode, RaisinNode } from "../../html-dom/RaisinNode";

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
  let tagName: string | undefined = undefined;

  if (!isElementNode(parent) && !isRoot(parent)) {
    // Non-element nodes aren't picky. Text doesn't say where it can be, it's the other side of
    // the relationship that enforces this
    return true;
  }

  let elementParent = parent as RaisinElementNode;

  tagName = elementParent.tagName;

  if (childMeta.validParents === undefined) {
    // No constraints, so all parents are allowed.
    return true;
  }

  // TODO: Use CSS selectors engine or ProseMirror content engine
  if (
    childMeta.validParents.includes(tagName) ||
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
