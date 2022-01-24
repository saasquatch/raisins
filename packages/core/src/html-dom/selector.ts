import { selectAll } from "css-select";
import { Adapter, Predicate } from "css-select/lib/types";
import {
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNode,
  RaisinNodeWithChildren,
} from "./RaisinNode";
import { getAncestry, getParents, visit } from "./util";

type Node = RaisinNode;
type ElementNode = RaisinElementNode;

class RaisinAdapter implements Adapter<RaisinNode, RaisinElementNode> {
  _parents: WeakMap<RaisinNode, RaisinNodeWithChildren>;

  constructor(private root: RaisinDocumentNode) {
    this._parents = getParents(root);
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
  getChildren = (node: Node) => (node as RaisinNodeWithChildren).children;
  /**
   * Get the name of the tag
   */
  getName = (elem: ElementNode) => elem.tagName;
  /**
   * Get the parent of the node
   */
  getParent = (node: ElementNode) =>
    (this._parents.get(node) as RaisinElementNode) || null;
  /**
   * Get the siblings of the node. Note that unlike jQuery's `siblings` method,
   * this is expected to include the current node as well
   */
  getSiblings(node: Node) {
    const parent = this._parents.get(node) as RaisinElementNode;
    return parent?.children;
  }
  /**
   * Get the text content of the node, and its children if it has any.
   */
  getText(node: Node) {
    return (
      visit<string>(node, {
        onComment: (_) => "",
        onDirective: (_) => "",
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
      const ancestors = getAncestry(this.root, node, this._parents);
      return [...acc, ...ancestors];
    }, [] as Node[]);
    return nodes.filter((n) => removable.includes(n));
  }

  /**
   * Finds all of the element nodes in the array that match the test predicate,
   * as well as any of their children that match it.
   */
  findAll(test: Predicate<ElementNode>, nodes: Node[]) {
    return (nodes.filter((n) => n.type === "tag") as ElementNode[]).reduce(
      (arr, n) => {
        const matchingChildren = (n.children.filter(
            (n) => n.type === "tag"
          ) as ElementNode[]).filter(test);
        if (test(n)) {
          return [...arr, n, ...matchingChildren];
        }
        return [...arr, ...matchingChildren];
      },
      [] as ElementNode[]
    );
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
    return this.findOne(test, elems) ? true : false;
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
  });
}
