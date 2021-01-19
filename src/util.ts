import { Node, Text, ProcessingInstruction, Element, Comment, NodeWithChildren, Document } from 'domhandler';
import { ElementType } from 'domelementtype';

export function visit<T>(node: Node, visitor: NodeVisitor<T>, recursive: boolean = true): T {
  let result: T;
  const skip = visitor.skipNode && visitor.skipNode(node);
  if (skip) {
    return;
  }

  switch (node.type) {
    case ElementType.Text:
      result = visitor.onText && visitor.onText(node as Text);
      break;
    case ElementType.Directive: {
      result = visitor.onDirective && visitor.onDirective(node as ProcessingInstruction);
      break;
    }
    case ElementType.Comment:
      result = visitor.onComment && visitor.onComment(node as Comment);
      break;
    case ElementType.Tag:
    case ElementType.Script:
    case ElementType.Style: {
      if (!visitor.onElement) break;
      const element = node as Element;
      const children = recursive ? element.children.map(c => visit(c, visitor, recursive)).filter(c => c !== undefined) : [];
      result = visitor.onElement(element, children);
      break;
    }
    case ElementType.CDATA: {
      if (!visitor.onCData) break;
      const cdata = node as NodeWithChildren;
      const children = recursive ? cdata.children.map(c => visit(c, visitor, recursive)).filter(c => c !== undefined) : [];
      result = visitor.onCData(cdata, children);
      break;
    }
    case ElementType.Root: {
      if (!visitor.onRoot) break;
      const root = node as Document;
      const children = recursive ? root.children.map(c => visit(c, visitor, recursive)).filter(c => c !== undefined) : [];
      result = visitor.onRoot(root, children);
      break;
    }
    case ElementType.Doctype: {
      // This type isn't used yet.
      throw new Error('Not implemented yet: ElementType.Doctype case');
    }
  }
  return result;
}

/**
 * A depth-first visitor that will visit the deepest children first
 */
export interface NodeVisitor<T> {
  skipNode?(node: Node): boolean;
  onText?(text: Text): T | undefined;
  onDirective?(directive: ProcessingInstruction): T | undefined;
  onComment?(comment: Comment): T | undefined;
  onElement?(element: Element, children?: T[]): T | undefined;
  onCData?(element: NodeWithChildren, children?: T[]): T | undefined;
  onRoot?(node: Document, children?: T[]): T | undefined;
}

/**
 * Returns a clone of `root` with `node` removed.
 *
 * @param root
 * @param node
 */
export function remove(root: Node, node: Node): Node {
  return visit(
    visit(root, {
      skipNode(n) {
        return n === node;
      },
      ...CloneVisitor,
    }),
    FreezeVisitor,
  );
}

/**
 * Returns a clone of `root` with `node` removed.
 *
 * @param root
 * @param node
 */
export function duplicate(root: Node, node: Node): Node {
  const cloneIfMatching = (n: Node) => (n === node ? [clone(n), clone(n)] : [clone(n)]);
  const DuplicateVisitor: NodeVisitor<Node[]> = {
    onText: cloneIfMatching,
    onDirective: cloneIfMatching,
    onComment: cloneIfMatching,
    onElement: (n, dupeChildren) => {
      if (node === n) {
        return [clone(n), clone(n)];
      }
      const children = flatDeep<Node>(dupeChildren);
      return [CloneVisitor.onElement(n, children)];
    },
    onCData: (n, dupeChildren) => {
      if (node === n) {
        return [clone(n), clone(n)];
      }
      const children = flatDeep<Node>(dupeChildren);
      return [CloneVisitor.onCData(n, children)];
    },
    onRoot: (n, dupeChildren) => {
      if (node === n) {
        return [clone(n), clone(n)];
      }
      const children = flatDeep<Node>(dupeChildren);
      return [CloneVisitor.onRoot(n, children)];
    },
  };

  const nodes = visit(root, DuplicateVisitor);
  // Root node should not be duplicatable
  return visit(nodes[0], FreezeVisitor);
}

export function move(root: Node, node: Node, newParent: Node, newIdx: number): Node {
  const cloned = clone(node);
  return visit(
    visit(root, {
      skipNode(n) {
        return n === node;
      },
      ...CloneVisitor,
      onElement(el, children) {
        const newChildren = el === newParent ? add(children, cloned, newIdx) : children;
        return CloneVisitor.onElement(el, newChildren);
      },
      onRoot(el, children) {
        const newChildren = el === newParent ? add(children, cloned, newIdx) : children;
        return CloneVisitor.onRoot(el, newChildren);
      },
    }),
    FreezeVisitor,
  );
}

function add<T>(arr: T[], el: T, idx: number): T[] {
  const before = arr.slice(0, idx);
  const after = arr.slice(idx, arr.length);
  return [...before, el, ...after];
}

function clone(node: Node) {
  return visit(node, CloneVisitor);
}
const FreezeVisitor: NodeVisitor<Node> = {
  onText: Object.freeze,
  onDirective: Object.freeze,
  onComment: Object.freeze,
  onElement: n => Object.freeze(n),
  onCData: n => Object.freeze(n),
  onRoot: n => Object.freeze(n),
};
const CloneVisitor: NodeVisitor<Node> = {
  onText: n => n.cloneNode(),
  onDirective: n => n.cloneNode(),
  onComment: n => n.cloneNode(),
  onElement: (elem, children) => {
    const clone = elem.cloneNode() as Element;
    setLinking(children, clone);
    clone.childNodes = children;
    return clone;
  },
  onCData: (cdata, children) => {
    const clone = cdata.cloneNode() as NodeWithChildren;
    setLinking(children, clone);
    clone.childNodes = children;
    return clone;
  },
  onRoot: (doc, children) => {
    const clone = doc.cloneNode() as NodeWithChildren;
    setLinking(children, clone);
    clone.childNodes = children;
    return clone;
  },
};

// to enable deep level flatten use recursion with reduce and concat
function flatDeep<T>(arr: any, d = 1): T[] {
  // @ts-ignore
  return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), []) : arr.slice();
}

function setLinking(children: Node[], parent: NodeWithChildren): void {
  for (let i = 1; i < children.length; i++) {
    children[i].parent = parent;
    children[i].prev = children[i - 1];
    children[i - 1].next = children[i];
  }
}
