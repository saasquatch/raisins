import { RaisinElementNode, RaisinNode } from '@raisins/core';
import { act, renderHook } from '@testing-library/react';
import { molecule, useMolecule } from 'bunshi/react';
import expect from 'expect';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { Module } from '../component-metamodel/types';
import { CoreMolecule } from '../core/CoreAtoms';
import { EditMolecule } from '../core/editting/EditAtoms';
import {
  ConfigMolecule,
  RaisinConfig,
  RaisinsProvider,
} from '../core/RaisinConfigScope';
import { CssEditingMolecule } from './CssEditingMolecule';
import {
  RAISIN_CSS_ATTR,
  RAISIN_DOCUMENT_CSS_ATTR,
  RAISIN_ID_ATTR,
  RAISIN_MANAGED_CSS_ATTR,
} from './RaisinCssIds';
import { RaisinIdsMolecule } from './RaisinIdsMolecule';

function useCssEditing() {
  const { HTMLAtom } = useMolecule(ConfigMolecule);
  const { RootNodeAtom } = useMolecule(CoreMolecule);
  const { DuplicateNodeAtom } = useMolecule(EditMolecule);
  const { UsedRaisinIdsAtom } = useMolecule(RaisinIdsMolecule);
  const {
    DocumentCssAtom,
    ManagedStyleSheetAtom,
    GetInstanceCssAtom,
    SetInstanceCssAtom,
    PersistStyleSheetAtom,
  } = useMolecule(CssEditingMolecule);

  const [documentCss, setDocumentCss] = useAtom(DocumentCssAtom);
  return {
    html: useAtomValue(HTMLAtom),
    root: useAtomValue(RootNodeAtom),
    documentCss,
    setDocumentCss,
    managedCss: useAtomValue(ManagedStyleSheetAtom),
    persistStyleSheet: useSetAtom(PersistStyleSheetAtom),
    getInstanceCss: useAtomValue(GetInstanceCssAtom),
    setInstanceCss: useSetAtom(SetInstanceCssAtom),
    usedIds: useAtomValue(UsedRaisinIdsAtom),
    duplicate: useSetAtom(DuplicateNodeAtom),
  };
}

function renderCssEditing(startingHtml: string) {
  const StoryMolecule = molecule<Partial<RaisinConfig>>(() => ({
    HTMLAtom: atom(startingHtml),
    PackagesAtom: atom([] as Module[]),
  }));
  const Wrapper: React.FC = ({ children }) => (
    <RaisinsProvider molecule={StoryMolecule}>{children}</RaisinsProvider>
  );
  return renderHook(() => useCssEditing(), { wrapper: Wrapper });
}

function findTags(node: RaisinNode, tagName: string): RaisinElementNode[] {
  const found: RaisinElementNode[] = [];
  const walk = (n: RaisinNode) => {
    if (n.type === 'tag' && n.tagName === tagName) found.push(n);
    if ('children' in n) n.children.forEach(walk);
  };
  walk(node);
  return found;
}

const findTag = (node: RaisinNode, tagName: string) =>
  findTags(node, tagName)[0];

describe('DocumentCssAtom', () => {
  it('round-trips through a marked style node in the document', () => {
    const { result } = renderCssEditing('<div></div>');
    expect(result.current.documentCss).toBe('');

    act(() => result.current.setDocumentCss('div { color: red }'));

    expect(result.current.documentCss).toBe('div{color:red}');
    expect(result.current.html).toContain('data-raisin-document-css');
    expect(result.current.html).toContain('div{color:red}');
  });

  it('removes the style node when cleared', () => {
    const { result } = renderCssEditing('<div></div>');
    act(() => result.current.setDocumentCss('div { color: red }'));
    act(() => result.current.setDocumentCss(''));

    expect(result.current.documentCss).toBe('');
    expect(result.current.html).not.toContain('data-raisin-document-css');
  });

  // css-tree recovers from malformed input rather than throwing, so partial
  // css is persisted in normalized form — it is never rejected.
  it('normalizes incomplete css instead of rejecting it', () => {
    const { result } = renderCssEditing('<div></div>');
    act(() => result.current.setDocumentCss('div { color:'));

    expect(result.current.documentCss).toBe('div{color:}');
  });
});

describe('SetInstanceCssAtom', () => {
  it('assigns a raisin id alongside the css', () => {
    const { result } = renderCssEditing('<div></div>');
    const div = findTag(result.current.root, 'div');

    act(() => result.current.setInstanceCss({ node: div, css: ':host{color:red}' }));

    const next = findTag(result.current.root, 'div');
    expect(next.attribs[RAISIN_CSS_ATTR]).toBe(':host{color:red}');
    expect(next.attribs[RAISIN_ID_ATTR]).toBeTruthy();
    expect(result.current.usedIds.size).toBe(1);
  });

  it('reuses the existing id when the css changes', () => {
    const { result } = renderCssEditing('<div></div>');
    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css: ':host{color:red}',
      })
    );
    const firstId = findTag(result.current.root, 'div').attribs[RAISIN_ID_ATTR];

    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css: ':host{color:blue}',
      })
    );

    expect(findTag(result.current.root, 'div').attribs[RAISIN_ID_ATTR]).toBe(
      firstId
    );
  });

  it('removes the css attribute but keeps the id when cleared', () => {
    const { result } = renderCssEditing('<div></div>');
    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css: ':host{color:red}',
      })
    );
    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css: '',
      })
    );

    const next = findTag(result.current.root, 'div');
    expect(next.attribs[RAISIN_CSS_ATTR]).toBeUndefined();
    expect(next.attribs[RAISIN_ID_ATTR]).toBeTruthy();
  });

  // Each write re-serializes the whole document and re-renders the canvas, and
  // widgets routinely rewrite unchanged sides (one box-model keystroke writes
  // all four).
  it('does not touch the document when the css is unchanged', () => {
    const { result } = renderCssEditing('<div></div>');
    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css: ':host{color:red}',
      })
    );

    const before = result.current.root;
    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css: ':host{color:red}',
      })
    );

    expect(result.current.root).toBe(before);
  });

  it('does not touch the document when clearing css that was never set', () => {
    const { result } = renderCssEditing('<div></div>');
    const before = result.current.root;

    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css: '',
      })
    );

    expect(result.current.root).toBe(before);
  });

  // Skipping unchanged writes must not skip assigning a missing id.
  it('still assigns an id when the css matches but the id is absent', () => {
    const { result } = renderCssEditing(
      `<div ${RAISIN_CSS_ATTR}=":host{color:red}"></div>`
    );

    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css: ':host{color:red}',
      })
    );

    expect(findTag(result.current.root, 'div').attribs[RAISIN_ID_ATTR]).toBeTruthy();
  });

  it('round-trips css containing quotes and ampersands through the html', () => {
    const css = '::part(x){&:hover{content:"a"}}';
    const { result } = renderCssEditing('<div></div>');

    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css,
      })
    );

    expect(result.current.html).toContain('&amp;:hover');
    expect(findTag(result.current.root, 'div').attribs[RAISIN_CSS_ATTR]).toBe(css);
  });
});

describe('PersistStyleSheetAtom', () => {
  it('inserts the managed stylesheet into serialized html', () => {
    const { result } = renderCssEditing('<div></div>');

    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css: ':host{color:red}',
      })
    );
    act(() => result.current.persistStyleSheet());

    expect(result.current.html).toContain(
      `${RAISIN_MANAGED_CSS_ATTR}="true"`
    );
    expect(result.current.html).toContain('[data-raisin-id=');
    expect(result.current.html).toContain('{color:red}');
  });

  it('replaces the persisted stylesheet when the derived css changes', () => {
    const { result } = renderCssEditing('<div></div>');

    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css: ':host{color:red}',
      })
    );
    act(() => result.current.persistStyleSheet());

    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css: ':host{color:blue}',
      })
    );
    act(() => result.current.persistStyleSheet());

    expect(result.current.html).toContain('{color:blue}');
    expect(result.current.html).not.toContain('{color:red}');
  });

  it('removes the persisted stylesheet when the derived css is empty', () => {
    const { result } = renderCssEditing('<div></div>');

    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css: ':host{color:red}',
      })
    );
    act(() => result.current.persistStyleSheet());

    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css: '',
      })
    );
    act(() => result.current.persistStyleSheet());

    expect(result.current.html).not.toContain(RAISIN_MANAGED_CSS_ATTR);
  });

  it('persists managed css alongside document css', () => {
    const { result } = renderCssEditing('<div></div>');

    act(() => result.current.setDocumentCss('body { margin: 0 }'));
    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css: ':host{color:blue}',
      })
    );
    act(() => result.current.persistStyleSheet());

    expect(result.current.html).toContain(RAISIN_DOCUMENT_CSS_ATTR);
    expect(result.current.html).toContain(RAISIN_MANAGED_CSS_ATTR);
    expect(result.current.html).toContain('body{margin:0}');
    expect(result.current.html).toContain('[data-raisin-id=');
    expect(result.current.html).toContain('{color:blue}');
    expect(result.current.managedCss).not.toContain('body{margin:0}');
  });
});

describe('ManagedStyleSheetAtom', () => {
  it('contains only scoped instance css', () => {
    const { result } = renderCssEditing('<div></div>');
    act(() => result.current.setDocumentCss('div { color: red }'));
    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css: ':host{color:blue}',
      })
    );

    const id = findTag(result.current.root, 'div').attribs[RAISIN_ID_ATTR];
    expect(result.current.managedCss).toBe(
      `[data-raisin-id="${id}"]{color:blue}`
    );
  });

  it('scopes each instance to its own id', () => {
    const { result } = renderCssEditing('<div></div><span></span>');
    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css: ':host{color:red}',
      })
    );
    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'span'),
        css: ':host{color:blue}',
      })
    );

    const divId = findTag(result.current.root, 'div').attribs[RAISIN_ID_ATTR];
    const spanId = findTag(result.current.root, 'span').attribs[RAISIN_ID_ATTR];
    expect(divId).not.toBe(spanId);
    expect(result.current.managedCss).toContain(
      `[data-raisin-id="${divId}"]{color:red}`
    );
    expect(result.current.managedCss).toContain(
      `[data-raisin-id="${spanId}"]{color:blue}`
    );
  });

  // Malformed css is re-balanced by the serializer, so one bad instance cannot
  // swallow the rules of the instances concatenated after it.
  it.each([
    ['an unterminated comment', ':host{color:red} /*'],
    ['an unterminated at-rule', ':host{color:red} @media (min-width:1px){'],
    ['a stray closing brace', ':host{color:red}}'],
    ['text that is not css', 'not css at all'],
  ])('contains %s within its own instance', (_label, css) => {
    const { result } = renderCssEditing(
      `<div ${RAISIN_CSS_ATTR}="${css}" ${RAISIN_ID_ATTR}="bad"></div>` +
        `<span ${RAISIN_CSS_ATTR}=":host{color:blue}" ${RAISIN_ID_ATTR}="good"></span>`
    );

    expect(result.current.managedCss).toContain(
      '[data-raisin-id="good"]{color:blue}'
    );
  });

  // An id is only assigned alongside css by SetInstanceCssAtom, but authored
  // html can carry css without one — those instances are silently skipped.
  it('skips instance css on an element with no id', () => {
    const { result } = renderCssEditing(
      `<div ${RAISIN_CSS_ATTR}=":host{color:red}"></div>`
    );

    expect(result.current.managedCss).toBe('');
  });

  // Scoped output is memoized per id+css so a keystroke doesn't re-scope every
  // styled element; these pin the ways that cache could serve the wrong thing.
  it('scopes identical css separately for each element', () => {
    const { result } = renderCssEditing(
      `<div ${RAISIN_CSS_ATTR}=":host{color:red}" ${RAISIN_ID_ATTR}="a"></div>` +
        `<span ${RAISIN_CSS_ATTR}=":host{color:red}" ${RAISIN_ID_ATTR}="b"></span>`
    );

    expect(result.current.managedCss).toBe(
      '[data-raisin-id="a"]{color:red}\n[data-raisin-id="b"]{color:red}'
    );
  });

  it('re-scopes an element after its css changes', () => {
    const { result } = renderCssEditing(
      `<div ${RAISIN_CSS_ATTR}=":host{color:red}" ${RAISIN_ID_ATTR}="a"></div>`
    );
    expect(result.current.managedCss).toBe('[data-raisin-id="a"]{color:red}');

    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css: ':host{color:blue}',
      })
    );

    expect(result.current.managedCss).toBe('[data-raisin-id="a"]{color:blue}');
  });

  it('drops an element from the sheet once its css is cleared', () => {
    const { result } = renderCssEditing(
      `<div ${RAISIN_CSS_ATTR}=":host{color:red}" ${RAISIN_ID_ATTR}="a"></div>` +
        `<span ${RAISIN_CSS_ATTR}=":host{color:blue}" ${RAISIN_ID_ATTR}="b"></span>`
    );

    act(() =>
      result.current.setInstanceCss({
        node: findTag(result.current.root, 'div'),
        css: '',
      })
    );

    expect(result.current.managedCss).toBe('[data-raisin-id="b"]{color:blue}');
  });
});

describe('DuplicateNodeAtom', () => {
  const withCss = `<div ${RAISIN_CSS_ATTR}=":host{color:red}" ${RAISIN_ID_ATTR}="r1"></div>`;

  it('gives the copy a fresh id and keeps its css', () => {
    const { result } = renderCssEditing(withCss);

    act(() => result.current.duplicate(findTag(result.current.root, 'div')));

    const divs = findTags(result.current.root, 'div');
    expect(divs).toHaveLength(2);
    expect(divs[0].attribs[RAISIN_ID_ATTR]).toBe('r1');
    expect(divs[1].attribs[RAISIN_ID_ATTR]).not.toBe('r1');
    expect(divs[1].attribs[RAISIN_CSS_ATTR]).toBe(':host{color:red}');
    expect(result.current.usedIds.size).toBe(2);
  });

  it('emits a separately scoped block for the copy', () => {
    const { result } = renderCssEditing(withCss);
    act(() => result.current.duplicate(findTag(result.current.root, 'div')));

    const [first, second] = findTags(result.current.root, 'div');
    expect(result.current.managedCss).toBe(
      `[data-raisin-id="${first.attribs[RAISIN_ID_ATTR]}"]{color:red}\n` +
        `[data-raisin-id="${second.attribs[RAISIN_ID_ATTR]}"]{color:red}`
    );
  });

  it('reassigns ids throughout a duplicated subtree', () => {
    const { result } = renderCssEditing(
      `<section ${RAISIN_ID_ATTR}="a"><div ${RAISIN_ID_ATTR}="b"><span ${RAISIN_ID_ATTR}="c"></span></div></section>`
    );

    act(() => result.current.duplicate(findTag(result.current.root, 'section')));

    expect(result.current.usedIds.size).toBe(6);
  });

  it('leaves an element with no id without one', () => {
    const { result } = renderCssEditing('<div></div>');

    act(() => result.current.duplicate(findTag(result.current.root, 'div')));

    const divs = findTags(result.current.root, 'div');
    expect(divs).toHaveLength(2);
    expect(divs[1].attribs[RAISIN_ID_ATTR]).toBeUndefined();
  });

  it('keeps ids unique across repeated duplication', () => {
    const { result } = renderCssEditing(withCss);

    act(() => result.current.duplicate(findTag(result.current.root, 'div')));
    act(() => result.current.duplicate(findTag(result.current.root, 'div')));

    const ids = findTags(result.current.root, 'div').map(
      d => d.attribs[RAISIN_ID_ATTR]
    );
    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(3);
  });
});
