import { cssParser, RaisinDocumentNode, RaisinStyleNode } from '@raisins/core';
import expect from 'expect';
import { VNode } from 'snabbdom';
import {
  RAISIN_DOCUMENT_CSS_ATTR,
  RAISIN_MANAGED_CSS_ATTR,
} from '../../css-editing/RaisinCssIds';
import { raisinToSnabbdom } from './raisinToSnabdom';

const styleNode = (
  attribs: Record<string, string>,
  css = 'div{color:red}'
): RaisinStyleNode => ({
  type: 'style',
  tagName: 'style',
  attribs,
  contents: cssParser(css),
});

const documentOf = (...children: RaisinStyleNode[]): RaisinDocumentNode => ({
  type: 'root',
  children,
});

const childrenOf = (vnode: VNode) => (vnode.children ?? []) as VNode[];

describe('raisinToSnabbdom style nodes', () => {
  it('renders an ordinary style node with its attributes', () => {
    const [style] = childrenOf(
      raisinToSnabbdom(documentOf(styleNode({ media: 'print' })))
    );

    expect(style.sel).toBe('style');
    expect(style.data?.attrs).toEqual({ media: 'print' });
    expect(style.text).toBe('div{color:red}');
  });

  // The document css is rendered through the managed stylesheet instead, so
  // rendering the node too would apply it twice.
  it('replaces the document css node with a comment', () => {
    const [style] = childrenOf(
      raisinToSnabbdom(documentOf(styleNode({ [RAISIN_DOCUMENT_CSS_ATTR]: 'true' })))
    );

    expect(style.sel).toBe('!');
    expect(style.text).toBe('raisin-document-css');
  });

  it('replaces the managed css node with a comment', () => {
    const [style] = childrenOf(
      raisinToSnabbdom(documentOf(styleNode({ [RAISIN_MANAGED_CSS_ATTR]: 'true' })))
    );

    expect(style.sel).toBe('!');
    expect(style.text).toBe('raisin-managed-css');
  });

  it('renders a style node with no contents', () => {
    const node = styleNode({});
    delete (node as { contents?: unknown }).contents;

    const [style] = childrenOf(raisinToSnabbdom(documentOf(node)));

    expect(style.sel).toBe('style');
    expect(style.text).toBeUndefined();
  });
});
