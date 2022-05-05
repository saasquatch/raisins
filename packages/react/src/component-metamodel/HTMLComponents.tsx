import { CustomElement, Slot } from './Component';

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
  name: '',
  title: 'Content',
};

const COMMON_HTML_ATTRS_SCHEMA = [
  {
    name: 'id',
    type: 'string',
  },
  {
    name: 'title',
    type: 'string',
  },
];

// 'a',
export const A: CustomElement = {
  title: 'Anchor',
  tagName: 'a',
  attributes: [
    {
      name: 'href',
      type: 'string',
    },
  ],
  slots: [DefaultSlot],
};

// 'abbr',
export const ABBR: CustomElement = {
  title: 'Abbreviation',
  tagName: 'abbr',
  attributes: [
    {
      name: 'title',
      type: 'string',
    },
  ],
  slots: [DefaultSlot],
};
// 'address',
export const ADDR: CustomElement = {
  title: 'Address',
  tagName: 'addr',
  attributes: [
    {
      name: 'href',
      type: 'string',
    },
  ],
  slots: [DefaultSlot],
};
// 'area',
export const AREA: CustomElement = {
  title: 'Area',
  tagName: 'area',
  slots: [DefaultSlot],
};
// 'article',
export const ARTICLE: CustomElement = {
  title: 'Article',
  tagName: 'article',
  slots: [DefaultSlot],
};
// 'aside',
export const ASIDE: CustomElement = {
  title: 'Aside',
  tagName: 'aside',
  slots: [DefaultSlot],
};
// 'audio',
export const AUDIO: CustomElement = {
  title: 'Audio',
  tagName: 'audio',
  attributes: [
    {
      name: 'src',
      type: 'string',
    },
  ],
  slots: [DefaultSlot],
};
// 'b',
export const B: CustomElement = {
  title: 'Bold Text',
  tagName: 'b',
  slots: [DefaultSlot],
};
// 'base',
export const BASE: CustomElement = {
  title: 'Base',
  tagName: 'base',
  slots: [DefaultSlot],
};
// 'bdi',
export const BDI: CustomElement = {
  title: 'Bidirectional Isolate',
  tagName: 'bdi',
  slots: [DefaultSlot],
};
// 'bdo',
export const BDO: CustomElement = {
  title: 'Bidirectional Override',
  tagName: 'bdo',
  slots: [DefaultSlot],
};
// 'big',
export const Big: CustomElement = {
  title: 'Big Text',
  tagName: 'big',
  slots: [DefaultSlot],
};
// 'blockquote',
export const BLOCKQUOTE: CustomElement = {
  title: 'Block Quote',
  tagName: 'blockquote',
  attributes: [
    {
      name: 'cite',
      type: 'string',
    },
  ],
  slots: [DefaultSlot],
};
// 'body',
export const BODY: CustomElement = {
  title: 'Body',
  tagName: 'body',
  slots: [DefaultSlot],
};
// 'br',
export const BR: CustomElement = {
  title: 'Line Break',
  tagName: 'br',
  slots: [{ ...DefaultSlot }],
};
// 'button',
export const BUTTON: CustomElement = {
  title: 'Button',
  tagName: 'button',
  slots: [DefaultSlot],
  slotEditor: 'richText',
};
// 'canvas',
export const CANVAS: CustomElement = {
  title: 'Canvas',
  tagName: 'canvas',
};
// 'caption',
export const CAPTION: CustomElement = {
  title: 'Table Caption',
  tagName: 'caption',
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  validParents: ['table'],
  slots: [{ ...DefaultSlot }],
};
// 'cite',
export const CITE: CustomElement = {
  title: 'Citation',
  tagName: 'cite',
  slots: [{ ...DefaultSlot }],
};
// 'code',
export const CODE: CustomElement = {
  title: 'Code',
  tagName: 'code',
  slots: [DefaultSlot],
};
// 'col',
export const COL: CustomElement = {
  title: 'Table Column',
  tagName: 'col',
  // Could use `span` property
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  validParents: ['colgroup'],
};
// 'colgroup',
export const COLGROUP: CustomElement = {
  title: 'Table Column Group',
  tagName: 'colgroup',
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  validParents: ['table'],
  slots: [{ ...DefaultSlot, validChildren: ['col'] }],
};
// 'data',
export const DATA: CustomElement = {
  title: 'Data',
  tagName: 'data',
  attributes: [
    {
      name: 'value',
      type: 'number',
    },
  ],
  slots: [{ ...DefaultSlot }],
};
// 'datalist',
export const DATALIST: CustomElement = {
  title: 'Data List',
  tagName: 'datalist',
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  slots: [{ ...DefaultSlot, validChildren: ['option'] }],
};
// 'dd',
export const DD: CustomElement = {
  title: 'Description Definition',
  tagName: 'dd',
  validParents: ['dl'],
  slots: [DefaultSlot],
};
// 'del',
export const DEL: CustomElement = {
  title: 'Deleted Text',
  tagName: 'del',
  slots: [DefaultSlot],
};
// 'details',
export const DETAILS: CustomElement = {
  title: 'Details',
  tagName: 'details',
  slots: [DefaultSlot],
};
// 'dfn',
export const DFN: CustomElement = {
  title: 'Definition',
  tagName: 'dfn',
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  slots: [DefaultSlot],
};
// 'dialog',
export const DIALOG: CustomElement = {
  title: 'Dialog',
  tagName: 'dialog',
  slots: [{ ...DefaultSlot, validChildren: ['*'] }],
};
// 'div',
export const DIV: CustomElement = {
  title: 'Block',
  tagName: 'div',
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  slots: [{ ...DefaultSlot, validChildren: ['*'] }],
};
// 'dl',
export const DL: CustomElement = {
  title: 'Description List',
  tagName: 'dl',
  slots: [{ ...DefaultSlot, validChildren: ['dd', 'dt'] }],
};
// 'dt',
export const DT: CustomElement = {
  title: 'Description Term',
  tagName: 'dt',
  validParents: ['dl'],
  slots: [DefaultSlot],
};
// 'em',
export const EM: CustomElement = {
  title: 'Emphasized Text',
  tagName: 'em',
  slots: [DefaultSlot],
};
// 'embed',
// 'fieldset',
export const FIELDSET: CustomElement = {
  title: 'Field Set',
  tagName: 'fieldset',
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  validParents: ['form'],
  slots: [{ ...DefaultSlot, validChildren: ['input', 'label', 'legend'] }],
};
// 'figcaption',
export const FIGCAPTION: CustomElement = {
  title: 'Figure Caption',
  tagName: 'figcaption',
  validParents: ['figure'],
  slots: [DefaultSlot],
};
// 'figure',
export const figure: CustomElement = {
  title: 'Figure',
  tagName: 'figure',
  slots: [DefaultSlot],
};
// 'footer',
export const FOOTER: CustomElement = {
  title: 'Footer',
  tagName: 'footer',
  slots: [DefaultSlot],
};
// 'form',
export const FORM: CustomElement = {
  title: 'Form',
  tagName: 'form',
  slots: [DefaultSlot],
};
// 'h1',
export const H1: CustomElement = {
  title: 'Heading 1',
  tagName: 'h1',
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  slots: [DefaultSlot],
};
// 'h2',
export const H2: CustomElement = {
  title: 'Heading 2',
  tagName: 'h2',
  slots: [DefaultSlot],
};
// 'h3',
export const H3: CustomElement = {
  title: 'Heading 3',
  tagName: 'h3',
  slots: [DefaultSlot],
};
// 'h4',
export const H4: CustomElement = {
  title: 'Heading 4',
  tagName: 'h4',
  slots: [DefaultSlot],
};
// 'h5',
export const H5: CustomElement = {
  title: 'Heading 5',
  tagName: 'h5',
  slots: [DefaultSlot],
};
// 'h6',
export const H6: CustomElement = {
  title: 'Heading 6',
  tagName: 'h6',
  slots: [DefaultSlot],
};
// 'head',
// 'header',
// 'hgroup',
// 'hr',
export const HR: CustomElement = {
  title: 'Thematic Break',
  tagName: 'hr',
};
// 'html',
// 'i',
export const I: CustomElement = {
  title: 'Italic Text',
  tagName: 'i',
  slots: [DefaultSlot],
};
// 'iframe',
// 'img',
export const IMG: CustomElement = {
  title: 'Image',
  tagName: 'img',
  attributes: [
    {
      name: 'src',
      type: 'string',
    },
    {
      name: 'alt',
      type: 'string',
    },
  ],
};
// 'input',
// 'ins',
// 'kbd',
// 'keygen',
// 'label',
// 'legend',
export const LEGEND: CustomElement = {
  title: 'Legend',
  tagName: 'legend',
  validParents: ['fieldset'],
  slots: [DefaultSlot],
};
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
  title: 'Paragraph',
  tagName: 'p',
  slots: [DefaultSlot],
};
// 'param',
// 'picture',
// 'pre',
// 'progress',
// 'q',
export const Q: CustomElement = {
  title: 'Quote',
  tagName: 'q',
  slots: [DefaultSlot],
};
// 'rp',
// 'rt',
// 'ruby',
// 's',
export const S: CustomElement = {
  title: 'Strike Through',
  tagName: 's',
  slots: [DefaultSlot],
};
// 'samp',
// 'script',
// 'section',
// 'select',
// 'small',
export const SMALL: CustomElement = {
  title: 'Small Text',
  tagName: 'small',
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  slots: [{ ...DefaultSlot }],
};
// 'source',
// 'span',
export const SPAN: CustomElement = {
  title: 'Text (span)',
  tagName: 'span',
  slots: [
    {
      ...DefaultSlot,
      validChildren: ['span'],
      editor: 'inline',
    },
  ],
};
// 'strong',
export const STRONG: CustomElement = {
  title: 'Text (strong)',
  tagName: 'strong',
  slots: [
    {
      ...DefaultSlot,
      validChildren: ['span'],
    },
  ],
};
// 'style',
// 'sub',
export const SUB: CustomElement = {
  title: 'Subscript Text',
  tagName: 'sub',
  slots: [DefaultSlot],
};
// 'summary',
// 'sup',
export const SUP: CustomElement = {
  title: 'Superscript Text',
  tagName: 'sup',
  slots: [DefaultSlot],
};
// 'table',
export const TABLE: CustomElement = {
  title: 'Table',
  tagName: 'table',
  slots: [
    {
      ...DefaultSlot,
      validChildren: ['caption', 'colgroup', 'thead', 'tbody', 'tr', 'tfoot'],
    },
  ],
};
// 'tbody',
export const TBODY: CustomElement = {
  title: 'Table Body',
  tagName: 'tbody',
  validParents: ['table'],
  slots: [
    {
      ...DefaultSlot,
      validChildren: ['tr'],
    },
  ],
};
// 'td',
export const TD: CustomElement = {
  title: 'Table Cell',
  tagName: 'td',
  validParents: ['tr'],
  slots: [
    {
      ...DefaultSlot,
      validChildren: ['*'],
    },
  ],
};
// 'textarea',
export const TEXTAREA: CustomElement = {
  title: 'Text Area',
  tagName: 'textarea',
  slots: [DefaultSlot],
};
// 'tfoot',
export const TFOOT: CustomElement = {
  title: 'Table Footer',
  tagName: 'tfoot',
  validParents: ['table'],
  slots: [
    {
      ...DefaultSlot,
      validChildren: ['tr'],
    },
  ],
};
// 'th',
export const TH: CustomElement = {
  title: 'Table Header Cell',
  tagName: 'th',
  validParents: ['tr'],
  slots: [
    {
      ...DefaultSlot,
      validChildren: ['*'],
    },
  ],
};
// 'thead',
export const THEAD: CustomElement = {
  title: 'Table Header',
  tagName: 'thead',
  validParents: ['table'],
  slots: [
    {
      ...DefaultSlot,
      validChildren: ['tr'],
    },
  ],
};
// 'time',
// 'title',
// 'tr',
export const TR: CustomElement = {
  title: 'Table Row',
  tagName: 'tr',
  validParents: ['thead', 'tfoot', 'tbody'],
  slots: [
    {
      ...DefaultSlot,
      validChildren: ['td', 'th'],
    },
  ],
};
// 'track',
// 'u',
export const U: CustomElement = {
  title: 'Underlined Text',
  tagName: 'u',
  slots: [DefaultSlot],
};
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
