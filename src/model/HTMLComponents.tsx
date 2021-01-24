import { ComponentType } from './Component';

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
// 'cite',
// 'code',
// 'col',
// 'colgroup',
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
};
// 'h2',
export const H2: ComponentType = {
  title: 'Heading 2',
  tagName: 'h2',
};
// 'h3',
export const H3: ComponentType = {
  title: 'Heading 3',
  tagName: 'h3',
};
// 'h4',
export const H4: ComponentType = {
  title: 'Heading 4',
  tagName: 'h4',
};
// 'h5',
export const H5: ComponentType = {
  title: 'Heading 5',
  tagName: 'h5',
};
// 'h6',
export const H6: ComponentType = {
  title: 'Heading 6',
  tagName: 'h6',
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
  childTags: ['span'],
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
  childTags: ['thead', 'tbody', 'tfoot'],
};
// 'tbody',
export const TBODT: ComponentType = {
  title: 'Table Body',
  tagName: 'tbody',
  childTags: ['tr'],
};
// 'td',
export const TD: ComponentType = {
  title: 'Table Cell',
  tagName: 'td',
  childTags: ['*'],
};
// 'textarea',
// 'tfoot',
export const TFOOT: ComponentType = {
  title: 'Table Footer',
  tagName: 'tfoot',
  childTags: ['tr'],
};
// 'th',
export const TH: ComponentType = {
  title: 'Table Header Cell',
  tagName: 'th',
  childTags: ['*'],
};
// 'thead',
export const THEAD: ComponentType = {
  title: 'Table Header',
  tagName: 'thead',
  childTags: ['tr'],
};
// 'time',
// 'title',
// 'tr',
export const TR: ComponentType = {
  title: 'Table Row',
  tagName: 'tr',
  childTags: ['td', 'th'],
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
