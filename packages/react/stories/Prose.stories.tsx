import { htmlParser, RaisinDocumentNode, RaisinNode } from '@raisins/core';
import { Meta } from '@storybook/react';
import { atom, useAtom } from 'jotai';
import React, { useRef } from 'react';
import {
  AtomProseEditor,
  ControlledProseEditor, RaisinProseState,
  useSelectionAtom
} from '../src/ProseEditor';
const meta: Meta = {
  title: 'Rich Text (Prose) Editor',
};
export default meta;

const span: RaisinNode = htmlParser(
  `A bunch of text nodes with <b>inline content</b> and <a href="example">links</a>`
);

export const Span = () => (
  <div>
    <AtomEditor
      initial={htmlParser(
        `A bunch of text nodes with <b>inline content</b> and <a href="example">links</a>`
      )}
    />
    <AtomEditor
      initial={htmlParser(
        `A bunch of text nodes with <b>inline content</b> and <a href="example">links</a>`
      )}
    />
  </div>
);
export const SpanUseState = () => (
  <div>
    <Editor
      initial={htmlParser(
        `A bunch of text nodes with <b>inline content</b> and <a href="example">links</a>`
      )}
    />{' '}
    <Editor
      initial={htmlParser(
        `A bunch of text nodes with <b>inline content</b> and <a href="example">links</a>`
      )}
    />
  </div>
);

export const TextWithBreaks = () => (
  <AtomEditor initial={htmlParser(`Text<br/>with<br/>breaks`)} />
);
export const Paragraphs = () => (
  <AtomEditor
    initial={htmlParser(`<p>First paragrpah</p><p>second paragrapj</p>`)}
  />
);
export const ParagraphsUseState = () => (
  <Editor
    initial={htmlParser(`<p>First paragrpah</p><p>second paragrapj</p>`)}
  />
);

function Editor({ initial }: { initial: RaisinNode }) {
  const atomRef = useRef(
    atom<RaisinProseState>({
      node: initial as RaisinDocumentNode,
      selection: undefined,
    })
  );
  const [state, setState] = useAtom(atomRef.current);
  return (
    <div>
      <ControlledProseEditor {...{ state, setState }} />
      <hr />
      Here is my state:
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}

function AtomEditor({ initial }: { initial: RaisinNode }) {
  const nodeAtom = useRef(
    atom<RaisinDocumentNode>(initial as RaisinDocumentNode)
  ).current;
  const selectionAtomRef = useSelectionAtom();

  const [selection] = useAtom(selectionAtomRef);
  const [node] = useAtom(nodeAtom);
  return (
    <div>
      <AtomProseEditor
        {...{
          nodeAtom: nodeAtom,
          selectionAtom: selectionAtomRef,
        }}
      />
      <hr />
      Here is my state:
      <pre>{JSON.stringify({ selection, node }, null, 2)}</pre>
    </div>
  );
}
