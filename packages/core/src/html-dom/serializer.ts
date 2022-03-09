import foreignNames from "./parser/foreignNames";
import { encodeXML } from "entities";
import type {
  RaisinCommentNode,
  RaisinElementNode,
  RaisinNode,
  RaisinNodeWithChildren,
  RaisinProcessingInstructionNode,
  RaisinTextNode,
} from "./RaisinNode";
import { getParents, visit } from "./util";
import cssSerializer from "../css-om/serializer";
import { CssNodePlain } from "css-tree";

/**
 *
 *  Forked from: https://github.com/cheeriojs/dom-serializer
 *
 *
 * LV: I don't like forking libraries, but in the case of DOM-Handler the programming style is very mutable. Even in forking the
 * code I found that the serializer was **mutating tag names as it was serializing them**. This feels like it would have unintended
 * side effects throughout the state tree.
 *
 * An alternate approach was considered for first turning `RaisinNode` nodes back into `domhandler` nodes, but that has previously
 * proven to be a cumbersome process:
 *  - `domhandler` nodes have multiple names and copies of the same property (e.g. `name` and `tagName`)
 *  - `domhandler` nodes need to be linked up with a `parent` and `prev` and `next`, even though the serializer only relies on `parent`
 *  - `domhandler` constructors for creating instances of their classes have caused build errors in the Raisin.js repo
 *
 *
 * This also adds a few features:
 *  - `style` tags have their CSS contents parsed and serialized
 *
 *  TODO: Also fork the test suite
 *
 */

const { attributeNames, elementNames } = foreignNames;
export interface DomSerializerOptions {
  xmlMode?: boolean | "foreign";
  decodeEntities?: boolean;
  emptyAttrs?: boolean;
  selfClosingTags?: boolean;
}

// Type for parents
type Parents = WeakMap<RaisinNode, RaisinNodeWithChildren>;

const unencodedElements = new Set([
  "style",
  "script",
  "xmp",
  "iframe",
  "noembed",
  "noframes",
  "plaintext",
  "noscript",
]);

/**
 * Format attributes
 */
function formatAttributes(
  attributes: Record<string, string | null> | undefined,
  opts: DomSerializerOptions
) {
  if (!attributes) return;

  return Object.keys(attributes)
    .map((key) => {
      const value = attributes[key] ?? "";

      if (opts.xmlMode === "foreign") {
        /* Fix up mixed-case attribute names */
        key = (attributeNames[key as keyof typeof attributeNames]) ?? key;
      }

      if (!opts.emptyAttrs && !opts.xmlMode && value === "") {
        // For boolean attributes
        // See: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes
        return key;
      }

      return `${key}="${
        opts.decodeEntities !== false
          ? encodeXML(value)
          : value.replace(/"/g, "&quot;")
      }"`;
    })
    .join(" ");
}

/**
 * Self-enclosing tags
 */
const singleTag = new Set([
  "area",
  "base",
  "basefont",
  "br",
  "col",
  "command",
  "embed",
  "frame",
  "hr",
  "img",
  "input",
  "isindex",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

/**
 * Renders a DOM node or an array of DOM nodes to a string.
 *
 * Can be thought of as the equivalent of the `outerHTML` of the passed node(s).
 *
 * @param node Node to be rendered.
 * @param options Changes serialization behavior
 */
export default function serializer(
  node: RaisinNode | RaisinNode[],
  options: DomSerializerOptions = {}
): string {
  const nodes: RaisinNode[] = Array.isArray(node)
    ? (node as RaisinNode[])
    : [node];

  let output = "";

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const parents = getParents(node);
    output += renderNode(node, options, parents);
  }

  return output;
}

function renderNode(
  node: RaisinNode,
  options: DomSerializerOptions,
  parents: Parents
): string {
  return visit(node, {
    onText: (n) => renderText(n, options, parents),
    onElement: (n, children) => renderTag(n, options, parents, children),
    onRoot(_, children?: string[]) {
      return children?.join("");
    },
    onStyle(n) {
      const cssContents = n.contents ? cssSerializer(n.contents) : "";
      const attribs = formatAttributes(n.attribs, options);
      return `<style${attribs ? " " + attribs : ""}>${cssContents}</style>`;
    },
    onDirective: renderDirective,
    onComment: renderComment,
  }) ?? "";
}

const foreignModeIntegrationPoints = new Set([
  "mi",
  "mo",
  "mn",
  "ms",
  "mtext",
  "annotation-xml",
  "foreignObject",
  "desc",
  "title",
]);

const foreignElements = new Set(["svg", "math"]);

function renderTag(
  elem: RaisinElementNode,
  opts: DomSerializerOptions,
  parents: Parents,
  children?: string[]
) {
  const parent = parents.get(elem);
  let { tagName } = elem;
  // Handle SVG / MathML in HTML
  if (opts.xmlMode === "foreign") {
    /* Fix up mixed-case element names */
    tagName = elementNames[elem.tagName as keyof typeof elementNames] ?? elem.tagName;
    /* Exit foreign mode at integration points */
    if (
      parent &&
      foreignModeIntegrationPoints.has((parent as RaisinElementNode).tagName)
    ) {
      opts = { ...opts, xmlMode: false };
    }
  }
  if (!opts.xmlMode && foreignElements.has(tagName)) {
    opts = { ...opts, xmlMode: "foreign" };
  }

  let tag = `<${tagName}`;
  const attribs = formatAttributes(elem.attribs, opts);

  if (attribs) {
    tag += ` ${attribs}`;
  }

  let style = elem.style && formatStyle(elem.style);
  if (style) {
    tag += ` ${style}`;
  }

  if (
    elem.children.length === 0 &&
    (opts.xmlMode
      ? // In XML mode or foreign mode, and user hasn't explicitly turned off self-closing tags
        opts.selfClosingTags !== false
      : // User explicitly asked for self-closing tags, even in HTML mode
        opts.selfClosingTags && singleTag.has(tagName))
  ) {
    if (!opts.xmlMode) tag += " ";
    tag += "/>";
  } else {
    tag += ">";
    if (elem.children.length > 0) {
      tag += children?.join("") ?? "";
    }

    if (opts.xmlMode || !singleTag.has(tagName)) {
      tag += `</${tagName}>`;
    }
  }

  return tag;
}

function renderDirective(elem: RaisinProcessingInstructionNode) {
  return `<${elem.data}>`;
}

function renderText(
  elem: RaisinTextNode,
  opts: DomSerializerOptions,
  parents: Parents
) {
  let data = elem.data || "";
  const parent = parents.get(elem);
  // If entities weren't decoded, no need to encode them back
  if (
    opts.decodeEntities !== false &&
    !(
      !opts.xmlMode &&
      parent &&
      unencodedElements.has((parent as RaisinElementNode).tagName)
    )
  ) {
    data = encodeXML(data);
  }

  return data;
}

function renderComment(elem: RaisinCommentNode) {
  return `<!--${elem.data}-->`;
}

function formatStyle(style: CssNodePlain): string | undefined {
  if (!style) return;
  const content = cssSerializer(style);
  return `style="${content}"`;
}
