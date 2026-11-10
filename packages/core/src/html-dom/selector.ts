import { is, selectAll, type Options } from "css-select";
import { DefaultTextMarks } from "./DefaultTextMarks.ts";
import type {
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNode,
  RaisinNodeWithChildren,
} from "./RaisinNode.ts";
import { getAncestry, getParents, visit } from "./util.ts";

type Node = RaisinNode;
type ElementNode = RaisinElementNode;

// css-select v5 doesn't export `lib/types`, so derive these from its public API
type Adapter = NonNullable<Options<RaisinNode, RaisinElementNode>["adapter"]>;
type Predicate<V> = (v: V) => boolean;
type Query = Parameters<typeof selectAll<RaisinNode, RaisinElementNode>>[0];

class RaisinAdapter implements Adapter {
  parentMap: WeakMap<RaisinNode, RaisinNodeWithChildren>;

  private root: RaisinDocumentNode;

  constructor(root: RaisinDocumentNode) {
    this.root = root;
    this.parentMap = getParents(root);
  }

  /**
   *  Is the node a tag?
   */
  isTag(node: Node): node is ElementNode {
    return node.type === "tag";
  }

  /**
   * Get the attribute value.
   */
  getAttributeValue(elem: ElementNode, name: string) {
    return elem.attribs[name];
  }

  /**
   * Get the node's children
   */
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- css-select only calls this for nodes it treats as parents; non-parents yield undefined
  getChildren = (node: Node) => (node as RaisinNodeWithChildren).children;
  /**
   * Get the name of the tag
   */
  getName = (elem: ElementNode) => elem.tagName;
  /**
   * Get the parent of the node
   */
  getParent = (node: ElementNode) =>
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Adapter requires ElementNode | null; the root parent is passed through as before
    (this.parentMap.get(node) as RaisinElementNode) || null;
  /**
   * Get the siblings of the node. Note that unlike jQuery's `siblings` method,
   * this is expected to include the current node as well
   */
  getSiblings(node: Node) {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Adapter requires Node[]; a missing parent still yields undefined at runtime as before
    const parent = this.parentMap.get(node) as RaisinElementNode;
    return parent?.children;
  }
  /**
   * Get the text content of the node, and its children if it has any.
   */
  getText(node: Node) {
    return (
      visit<string>(node, {
        onComment: () => "",
        onDirective: () => "",
        onElement: (_, c) => c.join(""),
        onRoot: (_, c) => c.join(""),
        onStyle: () => "",
        onText: (e) => e.data,
      }) ?? ""
    );
  }
  /**
   * Does the element have the named attribute?
   */
  hasAttrib = (elem: ElementNode, name: string) =>
    Object.keys(elem.attribs).includes(name);

  /**
   * Takes an array of nodes, and removes any duplicates, as well as any
   * nodes whose ancestors are also in the array.
   */
  removeSubsets(nodes: Node[]) {
    const removable = nodes.reduce((acc, node) => {
      const ancestors = getAncestry(this.root, node, this.parentMap);
      return [...acc, ...ancestors];
    }, [] as Node[]);
    return nodes.filter((n) => removable.includes(n));
  }

  /**
   * Finds all of the element nodes in the array that match the test predicate,
   * as well as any of their children that match it.
   */
  findAll(test: Predicate<ElementNode>, nodes: Node[]) {
    return nodes
      .filter((n) => n.type === "tag")
      .reduce((arr, n) => {
        const matchingChildren = n.children
          .filter((child) => child.type === "tag")
          .filter(test);
        if (test(n)) {
          return [...arr, n, ...matchingChildren];
        }
        return [...arr, ...matchingChildren];
      }, [] as ElementNode[]);
  }

  /**
   * Finds the first node in the array that matches the test predicate, or one
   * of its children.
   */
  findOne(test: Predicate<ElementNode>, elems: Node[]) {
    const all = this.findAll(test, elems);
    return all.length ? all[0] : null;
  }

  /**
   * Does at least one of passed element nodes pass the test predicate?
   */
  existsOne(test: Predicate<ElementNode>, elems: Node[]) {
    return !!this.findOne(test, elems);
  }

  /**
   * The adapter can also optionally include an equals method, if your DOM
   * structure needs a custom equality test to compare two objects which refer
   * to the same underlying node. If not provided, `css-select` will fall back to
   * `a === b`.
   */
  equals = (a: Node, b: Node) => a === b;
  /**
   * Is the element in hovered state?
   */
  isHovered = () => false;
  /**
   * Is the element in visited state?
   */
  isVisited = () => false;
  /**
   * Is the element in active state?
   */
  isActive = () => false;
}

export default function select(node: RaisinDocumentNode, query: string) {
  return selectAll(query, node, {
    adapter: new RaisinAdapter(node),
    cacheResults: false,
    context: node,
  });
}

const textMarksSet = new Set<string>(DefaultTextMarks);
export const matches = (
  root: RaisinDocumentNode,
  elem: RaisinElementNode,
  query: Query,
) =>
  is(elem, query, {
    adapter: new RaisinAdapter(root),
    context: root,
    pseudos: {
      group: (el, val) => {
        if (val === "inline") {
          return textMarksSet.has(el.tagName);
        }
        return false;
      },
    },
  });
