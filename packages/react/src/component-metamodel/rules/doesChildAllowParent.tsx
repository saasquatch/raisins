import { RaisinNode, RaisinNodeWithChildren } from '@raisins/core';
import { CustomElement } from '../Component';
import { isElementNode, isRoot } from '../../util/isNode';

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

  if (isRoot(parent)) {
    // Root element is always allowed.
    // This allows editing for fragments, since Root !== body
    return true;
  }
  if (!isElementNode(parent)) {
    // Non-element nodes aren't picky. Text doesn't say where it can be, it's the other side of
    // the relationship that enforces this
    return true;
  }

  if (isElementNode(parent)) {
    tagName = parent.tagName;
  }

  const hasConstraints = childMeta?.validParents !== undefined;
  if (!hasConstraints) {
    // No constraints, so all parents are allowed.
    return true;
  }

  if (hasConstraints && !tagName) {
    // If a child specifies a set of valid parents,
    // then it will not allow it parent elements without tag names (e.g. comments)
    return false;
  }

  // TODO: Use CSS selectors engine or ProseMirror content engine
  if (tagName && childMeta?.validParents?.includes(tagName)) {
    // Child allows parent
    return true;
  }
  return false;
}
