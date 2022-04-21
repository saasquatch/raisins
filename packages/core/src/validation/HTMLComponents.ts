import { CustomElement, Slot } from "@raisins/schema/schema";

/**
 * Standard HTML library of components
 *
 * These may need updating over time, and should allow for customization.
 *
 *
 *
 */
undefined;

const DefaultSlot: Slot = {
  name: "",
  title: "Content"
};

const COMMON_HTML_ATTRS_SCHEMA = [
  {
    name: "id",
    type: "string"
  },
  {
    name: "title",
    type: "string"
  }
];

// 'a',
export const A: CustomElement = {
  title: "Anchor",
  tagName: "a"
};

// 'abbr',
// 'address',
// 'area',
// 'article',
// 'aside',
// 'audio',
// 'b',
// 'base',
// 'bdi',
// 'bdo',
// 'big',
// 'blockquote',
// 'body',
// 'br',
export const BR: CustomElement = {
  title: "Line Break",
  tagName: "br",
  slots: [{ ...DefaultSlot }]
};
// 'button',
// 'canvas',
// 'caption',
export const CAPTION: CustomElement = {
  title: "Table Caption",
  tagName: "caption",
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  validParents: ["table"],
  slots: [{ ...DefaultSlot }]
};
// 'cite',
// 'code',
// 'col',
export const COL: CustomElement = {
  title: "Table Column",
  tagName: "col",
  // Could use `span` property
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  validParents: ["colgroup"]
};
// 'colgroup',
export const COLGROUP: CustomElement = {
  title: "Table Column Group",
  tagName: "colgroup",
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  validParents: ["table"],
  slots: [{ ...DefaultSlot, validChildren: ["col"] }]
};
// 'data',
// 'datalist',
// 'dd',
// 'del',
// 'details',
// 'dfn',
// 'dialog',
// 'div',
export const DIV: CustomElement = {
  title: "Block",
  tagName: "div",
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  slots: [{ ...DefaultSlot, validChildren: ["*"] }]
};

// 'dl',
// 'dt',
// 'em',
// 'embed',
// 'fieldset',
// 'figcaption',
// 'figure',
// 'footer',
// 'form',
// 'h1',
export const H1: CustomElement = {
  title: "Heading 1",
  tagName: "h1",
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  slots: [DefaultSlot]
};
// 'h2',
export const H2: CustomElement = {
  title: "Heading 2",
  tagName: "h2",
  slots: [DefaultSlot]
};
// 'h3',
export const H3: CustomElement = {
  title: "Heading 3",
  tagName: "h3",
  slots: [DefaultSlot]
};
// 'h4',
export const H4: CustomElement = {
  title: "Heading 4",
  tagName: "h4",
  slots: [DefaultSlot]
};
// 'h5',
export const H5: CustomElement = {
  title: "Heading 5",
  tagName: "h5",
  slots: [DefaultSlot]
};
// 'h6',
export const H6: CustomElement = {
  title: "Heading 6",
  tagName: "h6",
  slots: [DefaultSlot]
};
// 'head',
// 'header',
// 'hgroup',
// 'hr',
// 'html',
// 'i',
// 'iframe',
// 'img',
export const IMG: CustomElement = {
  title: "Image",
  tagName: "img"
};
// 'input',
// 'ins',
// 'kbd',
// 'keygen',
// 'label',
// 'legend',
// 'li',
// 'link',
// 'main',
// 'map',
// 'mark',
// 'marquee',
// 'menu',
// 'menuitem',
// 'meta',
// 'meter',
// 'nav',
// 'noscript',
// 'object',
// 'ol',
// 'optgroup',
// 'option',
// 'output',
// 'p',
export const P: CustomElement = {
  title: "Paragraph",
  tagName: "p",
  slots: [DefaultSlot]
};
// 'param',
// 'picture',
// 'pre',
// 'progress',
// 'q',
// 'rp',
// 'rt',
// 'ruby',
// 's',
// 'samp',
// 'script',
// 'section',
// 'select',
// 'small',
export const SMALL: CustomElement = {
  title: "Small Text",
  tagName: "small",
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  slots: [{ ...DefaultSlot }]
};
// 'source',
// 'span',
export const SPAN: CustomElement = {
  title: "Text (span)",
  tagName: "span",
  slots: [
    {
      ...DefaultSlot,
      validChildren: ["span"],
      editor: "inline"
    }
  ]
};
// 'strong',
export const STRONG: CustomElement = {
  title: "Text (strong)",
  tagName: "strong",
  slots: [
    {
      ...DefaultSlot,
      validChildren: ["span"]
    }
  ]
};
// 'style',
// 'sub',
// 'summary',
// 'sup',
// 'table',
export const TABLE: CustomElement = {
  title: "Table",
  tagName: "table",
  slots: [
    {
      ...DefaultSlot,
      validChildren: ["caption", "colgroup", "thead", "tbody", "tr", "tfoot"]
    }
  ]
};
// 'tbody',
export const TBODY: CustomElement = {
  title: "Table Body",
  tagName: "tbody",
  validParents: ["table"],
  slots: [
    {
      ...DefaultSlot,
      validChildren: ["tr"]
    }
  ]
};
// 'td',
export const TD: CustomElement = {
  title: "Table Cell",
  tagName: "td",
  validParents: ["tr"],
  slots: [
    {
      ...DefaultSlot,
      validChildren: ["*"]
    }
  ]
};
// 'textarea',
// 'tfoot',
export const TFOOT: CustomElement = {
  title: "Table Footer",
  tagName: "tfoot",
  validParents: ["table"],
  slots: [
    {
      ...DefaultSlot,
      validChildren: ["tr"]
    }
  ]
};
// 'th',
export const TH: CustomElement = {
  title: "Table Header Cell",
  tagName: "th",
  validParents: ["tr"],
  slots: [
    {
      ...DefaultSlot,
      validChildren: ["*"]
    }
  ]
};
// 'thead',
export const THEAD: CustomElement = {
  title: "Table Header",
  tagName: "thead",
  validParents: ["table"],
  slots: [
    {
      ...DefaultSlot,
      validChildren: ["tr"]
    }
  ]
};
// 'time',
// 'title',
// 'tr',
export const TR: CustomElement = {
  title: "Table Row",
  tagName: "tr",
  validParents: ["thead", "tfoot", "tbody"],
  slots: [
    {
      ...DefaultSlot,
      validChildren: ["td", "th"]
    }
  ]
};
// 'track',
// 'u',
// 'ul',
// 'var',
// 'video',
// 'wbr',

// // SVG
// 'circle',
// 'clipPath',
// 'defs',
// 'ellipse',
// 'foreignObject',
// 'g',
// 'image',
// 'line',
// 'linearGradient',
// 'mask',
// 'path',
// 'pattern',
// 'polygon',
// 'polyline',
// 'radialGradient',
// 'rect',
// 'stop',
// 'svg',
// 'text',
// 'tspan'
