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

//Future improvement:
//  Set up content categories to be used as boilerplate valid children/parents
//  This would allow us to provide even better plop target filtering
//  See link below.
//  https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#phrasing_content

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
  tagName: "a",
  slotEditor: "richText",
  attributes: [
    {
      name: "href",
      type: "string"
    }
  ],
  slots: [DefaultSlot]
};

// 'abbr',
export const ABBR: CustomElement = {
  title: "Abbreviation",
  tagName: "abbr",
  attributes: [
    {
      name: "title",
      type: "string"
    }
  ],
  slots: [DefaultSlot]
};
// 'address',
export const ADDR: CustomElement = {
  title: "Address",
  tagName: "addr",
  attributes: [
    {
      name: "href",
      type: "string"
    }
  ],
  slots: [DefaultSlot]
};
// 'area',
export const AREA: CustomElement = {
  title: "Area",
  tagName: "area",
  slots: [DefaultSlot]
};
// 'article',
export const ARTICLE: CustomElement = {
  title: "Article",
  tagName: "article",
  slots: [DefaultSlot]
};
// 'aside',
export const ASIDE: CustomElement = {
  title: "Aside",
  tagName: "aside",
  slots: [DefaultSlot]
};
// 'audio',
export const AUDIO: CustomElement = {
  title: "Audio",
  tagName: "audio",
  attributes: [
    {
      name: "src",
      type: "string"
    }
  ],
  slots: [DefaultSlot]
};
// 'b',
export const B: CustomElement = {
  title: "Bold Text",
  tagName: "b",
  slots: [DefaultSlot]
};
// 'base',
export const BASE: CustomElement = {
  title: "Base",
  tagName: "base",
  slots: [DefaultSlot]
};
// 'bdi',
export const BDI: CustomElement = {
  title: "Bidirectional Isolate",
  tagName: "bdi",
  slots: [DefaultSlot]
};
// 'bdo',
export const BDO: CustomElement = {
  title: "Bidirectional Override",
  tagName: "bdo",
  slots: [DefaultSlot]
};
// 'big',
export const Big: CustomElement = {
  title: "Big Text",
  tagName: "big",
  slots: [DefaultSlot]
};
// 'blockquote',
export const BLOCKQUOTE: CustomElement = {
  title: "Block Quote",
  tagName: "blockquote",
  attributes: [
    {
      name: "cite",
      type: "string"
    }
  ],
  slots: [DefaultSlot]
};
// 'body',
export const BODY: CustomElement = {
  title: "Body",
  tagName: "body",
  slots: [DefaultSlot]
};
// 'br',
export const BR: CustomElement = {
  title: "Line Break",
  tagName: "br",
  slots: [{ ...DefaultSlot }]
};
// 'button',
export const BUTTON: CustomElement = {
  title: "Button",
  tagName: "button",
  slotEditor: "richText",
  slots: [DefaultSlot]
};
// 'canvas',
export const CANVAS: CustomElement = {
  title: "Canvas",
  tagName: "canvas"
};
// 'caption',
export const CAPTION: CustomElement = {
  title: "Table Caption",
  tagName: "caption",
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  validParents: ["table"],
  slots: [{ ...DefaultSlot }]
};
// 'cite',
export const CITE: CustomElement = {
  title: "Citation",
  tagName: "cite",
  slots: [{ ...DefaultSlot }]
};
// 'code',
export const CODE: CustomElement = {
  title: "Code",
  tagName: "code",
  slots: [DefaultSlot]
};
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
export const DATA: CustomElement = {
  title: "Data",
  tagName: "data",
  slots: [{ ...DefaultSlot }]
};
// 'datalist',
export const DATALIST: CustomElement = {
  title: "Data List",
  tagName: "datalist",
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  slots: [{ ...DefaultSlot, validChildren: ["option"] }]
};
// 'dd',
export const DD: CustomElement = {
  title: "Description Definition",
  tagName: "dd",
  validParents: ["dl"],
  slots: [DefaultSlot]
};
// 'del',
export const DEL: CustomElement = {
  title: "Deleted Text",
  tagName: "del",
  slots: [DefaultSlot]
};
// 'details',
export const DETAILS: CustomElement = {
  title: "Details",
  tagName: "details",
  slots: [DefaultSlot]
};
// 'dfn',
export const DFN: CustomElement = {
  title: "Definition",
  tagName: "dfn",
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  slots: [DefaultSlot]
};
// 'dialog',
export const DIALOG: CustomElement = {
  title: "Dialog",
  tagName: "dialog",
  slots: [{ ...DefaultSlot, validChildren: ["*"] }]
};
// 'div',
export const DIV: CustomElement = {
  title: "Block",
  tagName: "div",
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  slots: [{ ...DefaultSlot, validChildren: ["*"] }]
};
// 'dl',
export const DL: CustomElement = {
  title: "Description List",
  tagName: "dl",
  slots: [{ ...DefaultSlot, validChildren: ["dd", "dt"] }]
};
// 'dt',
export const DT: CustomElement = {
  title: "Description Term",
  tagName: "dt",
  validParents: ["dl"],
  slots: [DefaultSlot]
};
// 'em',
export const EM: CustomElement = {
  title: "Emphasized Text",
  tagName: "em",
  slots: [DefaultSlot]
};
// 'embed',
export const EMBED: CustomElement = {
  title: "Embed",
  tagName: "embed"
};
// 'fieldset',
export const FIELDSET: CustomElement = {
  title: "Field Set",
  tagName: "fieldset",
  validParents: ["form"],
  slots: [{ ...DefaultSlot, validChildren: ["input", "label", "legend"] }]
};
// 'figcaption',
export const FIGCAPTION: CustomElement = {
  title: "Figure Caption",
  tagName: "figcaption",
  validParents: ["figure"],
  slots: [DefaultSlot]
};
// 'figure',
export const figure: CustomElement = {
  title: "Figure",
  tagName: "figure",
  slots: [DefaultSlot]
};
// 'footer',
export const FOOTER: CustomElement = {
  title: "Footer",
  tagName: "footer",
  slots: [DefaultSlot]
};
// 'form',
export const FORM: CustomElement = {
  title: "Form",
  tagName: "form",
  slots: [DefaultSlot]
};
// 'h1',
export const H1: CustomElement = {
  title: "Heading 1",
  tagName: "h1",
  slotEditor: "richText",
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  slots: [DefaultSlot]
};
// 'h2',
export const H2: CustomElement = {
  title: "Heading 2",
  tagName: "h2",
  slotEditor: "richText",
  slots: [DefaultSlot]
};
// 'h3',
export const H3: CustomElement = {
  title: "Heading 3",
  tagName: "h3",
  slotEditor: "richText",
  slots: [DefaultSlot]
};
// 'h4',
export const H4: CustomElement = {
  title: "Heading 4",
  tagName: "h4",
  slotEditor: "richText",
  slots: [DefaultSlot]
};
// 'h5',
export const H5: CustomElement = {
  title: "Heading 5",
  tagName: "h5",
  slotEditor: "richText",
  slots: [DefaultSlot]
};
// 'h6',
export const H6: CustomElement = {
  title: "Heading 6",
  tagName: "h6",
  slotEditor: "richText",
  slots: [DefaultSlot]
};
// 'head',
export const HEAD: CustomElement = {
  title: "Head",
  tagName: "head",
  slots: [DefaultSlot]
};
// 'header',
export const HEADER: CustomElement = {
  title: "Header",
  tagName: "header",
  slots: [DefaultSlot]
};
// 'hgroup',
export const HGROUP: CustomElement = {
  title: "Header Group",
  tagName: "hgroup",
  slots: [
    { ...DefaultSlot, validChildren: ["h1", "h2", "h3", "h4", "h5", "h6"] }
  ]
};
// 'hr',
export const HR: CustomElement = {
  title: "Thematic Break",
  tagName: "hr"
};
// 'html',
export const HTML: CustomElement = {
  title: "HTML",
  tagName: "html",
  slots: [DefaultSlot]
};
// 'i',
export const I: CustomElement = {
  title: "Italic Text",
  tagName: "i",
  slots: [DefaultSlot]
};
// 'iframe',
export const IFRAME: CustomElement = {
  title: "Inline Frame",
  tagName: "iframe",
  attributes: [
    ...COMMON_HTML_ATTRS_SCHEMA,
    {
      name: "src",
      type: "string"
    }
  ]
};
// 'img',
export const IMG: CustomElement = {
  title: "Image",
  tagName: "img",
  attributes: [
    {
      name: "src",
      type: "string"
    },
    {
      name: "alt",
      type: "string"
    }
  ]
};
// 'input',
export const INPUT: CustomElement = {
  title: "Input",
  tagName: "input"
};
// 'ins',
export const INS: CustomElement = {
  title: "Inserted Text",
  tagName: "ins"
};
// 'kbd',
export const KBD: CustomElement = {
  title: "Keyboard Input",
  tagName: "kbd",
  slots: [DefaultSlot]
};
// 'keygen',
export const KEYGEN: CustomElement = {
  title: "Key Generator",
  tagName: "keygen"
};
// 'label',
export const LABEL: CustomElement = {
  title: "Label",
  tagName: "label",
  slots: [DefaultSlot]
};
// 'legend',
export const LEGEND: CustomElement = {
  title: "Legend",
  tagName: "legend",
  validParents: ["fieldset"],
  slots: [DefaultSlot]
};
// 'li',
export const LI: CustomElement = {
  title: "List Item",
  tagName: "li",
  slotEditor: "richText",
  validParents: ["ul", "ol", "menu", "dir"],
  slots: [DefaultSlot]
};
// 'link',
export const LINK: CustomElement = {
  title: "Link",
  tagName: "link"
};
// 'main',
export const MAIN: CustomElement = {
  title: "Main",
  tagName: "main",
  slots: [DefaultSlot]
};
// 'map',
export const MAP: CustomElement = {
  title: "Map",
  tagName: "map",
  slots: [DefaultSlot]
};
// 'mark',
export const MARK: CustomElement = {
  title: "Mark",
  tagName: "mark",
  slots: [DefaultSlot]
};
// 'marquee',
export const MARQUEE: CustomElement = {
  title: "Marquee",
  tagName: "marquee",
  slots: [DefaultSlot]
};
// 'menu',
export const MENU: CustomElement = {
  title: "Menu",
  tagName: "menu",
  slots: [{ ...DefaultSlot, validChildren: ["li", "menuitem"] }]
};
// 'menuitem',
export const MENUITEM: CustomElement = {
  title: "Menu Item",
  tagName: "menuitem",
  validParents: ["menu"]
};
// 'meta',
export const META: CustomElement = {
  title: "Meta",
  tagName: "meta"
};
// 'meter',
export const METER: CustomElement = {
  title: "Meter",
  tagName: "meter",
  slots: [DefaultSlot]
};
// 'nav',
export const Nav: CustomElement = {
  title: "Navigation",
  tagName: "nav",
  slots: [DefaultSlot]
};
// 'noscript',
export const NOSCRIPT: CustomElement = {
  title: "Noscript",
  tagName: "noscript",
  slots: [DefaultSlot]
};
// 'object',
export const OBJECT: CustomElement = {
  title: "Object",
  tagName: "object",
  slots: [{ ...DefaultSlot, validChildren: ["param"] }]
};
// 'ol',
export const OL: CustomElement = {
  title: "Ordered List",
  tagName: "ol",
  slots: [{ ...DefaultSlot, validChildren: ["li", "script", "template"] }]
};
// 'optgroup',
export const OPTGROUP: CustomElement = {
  title: "Option Group",
  tagName: "optgroup",
  validParents: ["select"],
  slots: [{ ...DefaultSlot, validChildren: ["option"] }]
};
// 'option',
export const OPTION: CustomElement = {
  title: "Option",
  tagName: "option",
  validParents: ["select", "optgroup", "datalist"],
  slots: [DefaultSlot]
};
// 'output',
export const OUTPUT: CustomElement = {
  title: "Output",
  tagName: "output",
  slots: [DefaultSlot]
};
// 'p',
export const P: CustomElement = {
  title: "Paragraph",
  tagName: "p",
  slotEditor: "richText",
  slots: [DefaultSlot]
};
// 'param',
export const PARAM: CustomElement = {
  title: "Parameter",
  tagName: "param",
  validParents: ["object"]
};
// 'picture',
export const PICTURE: CustomElement = {
  title: "Picture",
  tagName: "picture",
  slots: [{ ...DefaultSlot, validChildren: ["source", "img"] }]
};
// 'pre',
export const PRE: CustomElement = {
  title: "Preformatted Text",
  tagName: "pre",
  slots: [DefaultSlot]
};
// 'progress',
export const PROGRESS: CustomElement = {
  title: "Progress",
  tagName: "progress",
  slots: [DefaultSlot]
};
// 'q',
export const Q: CustomElement = {
  title: "Quote",
  tagName: "q",
  slots: [DefaultSlot]
};
// 'rp',
export const RP: CustomElement = {
  title: "Ruby Fallback Parenthesis",
  tagName: "rp",
  validParents: ["ruby"],
  slots: [DefaultSlot]
};
// 'rt',
export const RT: CustomElement = {
  title: "Ruby Text",
  tagName: "rt",
  validParents: ["ruby"],
  slots: [DefaultSlot]
};
// 'rtc,
export const RTC: CustomElement = {
  title: "Ruby Text",
  tagName: "rtc",
  validParents: ["ruby"],
  slots: [DefaultSlot]
};
// 'ruby',
export const RUBY: CustomElement = {
  title: "Ruby Annotation",
  tagName: "ruby",
  slots: [DefaultSlot]
};
// 's',
export const S: CustomElement = {
  title: "Strike Through",
  tagName: "s",
  slots: [DefaultSlot]
};
// 'samp',
export const SAMP: CustomElement = {
  title: "Sample Output",
  tagName: "samp",
  slots: [DefaultSlot]
};
// 'script',
export const SCRIPT: CustomElement = {
  title: "Script",
  tagName: "script",
  slots: [DefaultSlot]
};
// 'section',
export const SECTION: CustomElement = {
  title: "Section",
  tagName: "section",
  slots: [DefaultSlot]
};
// 'select',
export const SELECT: CustomElement = {
  title: "Select",
  tagName: "select",
  slots: [{ ...DefaultSlot, validChildren: ["option", "optgroup"] }]
};
// 'small',
export const SMALL: CustomElement = {
  title: "Small Text",
  tagName: "small",
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  slots: [{ ...DefaultSlot }]
};
// 'source',
export const SOURCE: CustomElement = {
  title: "Source",
  tagName: "source"
};
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
export const STYLE: CustomElement = {
  title: "Style",
  tagName: "style",
  slots: [DefaultSlot]
};
// 'sub',
export const SUB: CustomElement = {
  title: "Subscript Text",
  tagName: "sub",
  slots: [DefaultSlot]
};
// 'summary',
export const SUMMARY: CustomElement = {
  title: "Summary",
  tagName: "summary",
  validParents: ["details"],
  slots: [DefaultSlot]
};
// 'sup',
export const SUP: CustomElement = {
  title: "Superscript Text",
  tagName: "sup",
  slots: [DefaultSlot]
};
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
export const TEXTAREA: CustomElement = {
  title: "Text Area",
  tagName: "textarea",
  slots: [DefaultSlot]
};
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
export const TIME: CustomElement = {
  title: "Time",
  tagName: "time",
  slots: [DefaultSlot]
};
// 'title',
export const TITLE: CustomElement = {
  title: "Document Title",
  tagName: "title",
  slots: [DefaultSlot]
};
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
export const TRACK: CustomElement = {
  title: "Track",
  tagName: "track"
};
// 'u',
export const U: CustomElement = {
  title: "Underlined Text",
  tagName: "u",
  slots: [DefaultSlot]
};
// 'ul',
export const UL: CustomElement = {
  title: "Unordered List",
  tagName: "ul",
  slots: [{ ...DefaultSlot, validChildren: ["li", "script", "template"] }]
};
// 'var',
export const VAR: CustomElement = {
  title: "Variable",
  tagName: "var",
  slots: [DefaultSlot]
};
// 'video',
export const VIDEO: CustomElement = {
  title: "Video",
  tagName: "video",
  slots: [DefaultSlot]
};
// 'wbr',
export const WBR: CustomElement = {
  title: "Line Break Opportunity",
  tagName: "wbr"
};

// // SVG
// 'circle',
export const CIRCLE: CustomElement = {
  title: "Circle",
  tagName: "circle",
  slots: [DefaultSlot]
};
// 'clipPath',
export const clipPath: CustomElement = {
  title: "Clipping Path",
  tagName: "clipPath",
  slots: [DefaultSlot]
};
// 'defs',
export const DEFS: CustomElement = {
  title: "Definitions",
  tagName: "defs",
  slots: [DefaultSlot]
};
// 'ellipse',
export const ELLIPSE: CustomElement = {
  title: "Ellipse",
  tagName: "video",
  slots: [DefaultSlot]
};
// 'foreignObject',
export const FOREIGNOBJECT: CustomElement = {
  title: "Foreign Object",
  tagName: "foreignObject",
  slots: [DefaultSlot]
};
// 'g',
export const G: CustomElement = {
  title: "SVG Group",
  tagName: "g",
  slots: [DefaultSlot]
};
// 'image',
export const IMAGE: CustomElement = {
  title: "Image",
  tagName: "image",
  slots: [DefaultSlot]
};
// 'line',
export const LINE: CustomElement = {
  title: "Line",
  tagName: "line",
  slots: [DefaultSlot]
};
// 'linearGradient',
export const LINEARGRADIENT: CustomElement = {
  title: "Linear Gradient",
  tagName: "linearGradient",
  slots: [DefaultSlot]
};
// 'mask',
export const MASK: CustomElement = {
  title: "Mask",
  tagName: "mask",
  slots: [DefaultSlot]
};
// 'path',
export const PATH: CustomElement = {
  title: "Path",
  tagName: "path",
  slots: [DefaultSlot]
};
// 'pattern',
export const PATTERN: CustomElement = {
  title: "Pattern",
  tagName: "pattern",
  slots: [DefaultSlot]
};
// 'polygon',
export const POLYGON: CustomElement = {
  title: "Polygon",
  tagName: "polygon",
  slots: [DefaultSlot]
};
// 'polyline',
export const POLYLINE: CustomElement = {
  title: "Polyline",
  tagName: "polyline",
  slots: [DefaultSlot]
};
// 'radialGradient',
export const RADIALGRADIENT: CustomElement = {
  title: "Radial Gradient",
  tagName: "radialGradient",
  slots: [DefaultSlot]
};
// 'rect',
export const RECT: CustomElement = {
  title: "Rectangle",
  tagName: "rectangle",
  slots: [DefaultSlot]
};
// 'stop',
export const STOP: CustomElement = {
  title: "Stop",
  tagName: "stop",
  slots: [DefaultSlot]
};
// 'svg',
export const SVG: CustomElement = {
  title: "SVG",
  tagName: "svg",
  slots: [DefaultSlot]
};
// 'text',
export const TEXT: CustomElement = {
  title: "Text",
  tagName: "text",
  slots: [DefaultSlot]
};
// 'tspan'
export const TSPAN: CustomElement = {
  title: "T Span",
  tagName: "tspan",
  slots: [DefaultSlot]
};
