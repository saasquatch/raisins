import { ComponentType, SlotType } from './Component';

const DefaultSlot: SlotType = {
  key: '',
  title: 'Default slot',
};

const COMMON_HTML_ATTRS_SCHEMA = {
  properties: {
    id: {
      type: 'string',
    },
    title: {
      type: 'string',
    },
  },
};
// 'a',
export const A: ComponentType = {
  title: 'Anchor',
  tagName: 'a',
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
// 'button',
// 'canvas',
// 'caption',
export const CAPTION: ComponentType = {
  title: 'Table Caption',
  tagName: 'caption',
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  parentTags: ['table'],
  slots: [{ ...DefaultSlot }],
};
// 'cite',
// 'code',
// 'col',
export const COL: ComponentType = {
  title: 'Table Column',
  tagName: 'col',
  // Could use `span` property
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  parentTags: ['colgroup'],
};
// 'colgroup',
export const COLGROUP: ComponentType = {
  title: 'Table Column Group',
  tagName: 'colgroup',
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  parentTags: ['table'],
  slots: [{ ...DefaultSlot, childTags: ['col'] }],
};
// 'data',
// 'datalist',
// 'dd',
// 'del',
// 'details',
// 'dfn',
// 'dialog',
// 'div',
export const DIV: ComponentType = {
  title: 'Block',
  tagName: 'div',
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  slots: [{ ...DefaultSlot, childTags: ['*'] }],
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
export const H1: ComponentType = {
  title: 'Heading 1',
  tagName: 'h1',
  attributes: COMMON_HTML_ATTRS_SCHEMA,
  slots: [DefaultSlot],
};
// 'h2',
export const H2: ComponentType = {
  title: 'Heading 2',
  tagName: 'h2',
  slots: [DefaultSlot],
};
// 'h3',
export const H3: ComponentType = {
  title: 'Heading 3',
  tagName: 'h3',
  slots: [DefaultSlot],
};
// 'h4',
export const H4: ComponentType = {
  title: 'Heading 4',
  tagName: 'h4',
  slots: [DefaultSlot],
};
// 'h5',
export const H5: ComponentType = {
  title: 'Heading 5',
  tagName: 'h5',
  slots: [DefaultSlot],
};
// 'h6',
export const H6: ComponentType = {
  title: 'Heading 6',
  tagName: 'h6',
  slots: [DefaultSlot],
};
// 'head',
// 'header',
// 'hgroup',
// 'hr',
// 'html',
// 'i',
// 'iframe',
// 'img',
export const IMG: ComponentType = {
  title: 'Image',
  tagName: 'img',
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
export const P: ComponentType = {
  title: 'Paragraph',
  tagName: 'p',
  slots: [DefaultSlot],
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
// 'source',
// 'span',
export const SPAN: ComponentType = {
  title: 'Text (span)',
  tagName: 'span',
  slots: [
    {
      ...DefaultSlot,
      childTags: ['span'],
    },
  ],
};
// 'strong',
// 'style',
// 'sub',
// 'summary',
// 'sup',
// 'table',
export const TABLE: ComponentType = {
  title: 'Table',
  tagName: 'table',
  slots: [
    {
      ...DefaultSlot,
      childTags: ['caption', 'colgroup', 'thead', 'tbody', 'tr', 'tfoot'],
    },
  ],
};
// 'tbody',
export const TBODY: ComponentType = {
  title: 'Table Body',
  tagName: 'tbody',
  parentTags: ['table'],
  slots: [
    {
      ...DefaultSlot,
      childTags: ['tr'],
    },
  ],
};
// 'td',
export const TD: ComponentType = {
  title: 'Table Cell',
  tagName: 'td',
  parentTags: ['tr'],
  slots: [
    {
      ...DefaultSlot,
      childTags: ['*'],
    },
  ],
};
// 'textarea',
// 'tfoot',
export const TFOOT: ComponentType = {
  title: 'Table Footer',
  tagName: 'tfoot',
  parentTags: ['table'],
  slots: [
    {
      ...DefaultSlot,
      childTags: ['tr'],
    },
  ],
};
// 'th',
export const TH: ComponentType = {
  title: 'Table Header Cell',
  tagName: 'th',
  parentTags: ['tr'],
  slots: [
    {
      ...DefaultSlot,
      childTags: ['*'],
    },
  ],
};
// 'thead',
export const THEAD: ComponentType = {
  title: 'Table Header',
  tagName: 'thead',
  parentTags: ['table'],
  slots: [
    {
      ...DefaultSlot,
      childTags: ['tr'],
    },
  ],
};
// 'time',
// 'title',
// 'tr',
export const TR: ComponentType = {
  title: 'Table Row',
  tagName: 'tr',
  parentTags: ['thead', 'tfoot', 'tbody'],
  slots: [
    {
      ...DefaultSlot,
      childTags: ['td', 'th'],
    },
  ],
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
