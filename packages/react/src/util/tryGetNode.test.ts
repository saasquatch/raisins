import { describe, expect, it } from 'vitest';
import { getPath, htmlParser, RaisinElementNode } from '@raisins/core';
import { tryGetNode } from './tryGetNode';

const doc = htmlParser('<div><span>hello</span><p>world</p></div>');
const div = doc.children[0] as RaisinElementNode;
const span = div.children[0] as RaisinElementNode;
const text = span.children[0];

describe('tryGetNode', () => {
  it('resolves valid paths, matching getPath round-trips', () => {
    expect(tryGetNode(doc, [])).toBe(doc);
    expect(tryGetNode(doc, getPath(doc, div)!)).toBe(div);
    expect(tryGetNode(doc, getPath(doc, span)!)).toBe(span);
    expect(tryGetNode(doc, getPath(doc, text)!)).toBe(text);
  });

  it('returns undefined for out-of-bounds paths instead of throwing', () => {
    // core's getNode crashes here reading `.type` of undefined
    expect(tryGetNode(doc, [0, 5])).toBeUndefined();
    expect(tryGetNode(doc, [0, 5, 0])).toBeUndefined();
  });

  it('returns undefined for paths descending into childless nodes', () => {
    // core's getNode throws `Node type text doesn't have children` here
    expect(tryGetNode(doc, [0, 0, 0, 0])).toBeUndefined();
  });
});
