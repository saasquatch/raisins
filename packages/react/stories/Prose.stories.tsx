import { htmlParser, RaisinNode } from '@raisins/core';
import { Meta } from '@storybook/react';
import React, { useState } from 'react';
import { ControlledProseEditor, RaisinProseState } from '../src/ProseEditor';
const meta: Meta = {
  title: 'Rich Text (Prose) Editor',
};
export default meta;

const span: RaisinNode = htmlParser(
  `A bunch of text nodes with <b>inline content</b> and <a href="example">links</a>`
);

export const Span = () => (
  <Editor
    initial={htmlParser(
      `A bunch of text nodes with <b>inline content</b> and <a href="example">links</a>`
    )}
  />
);

export const TextWithBreaks = () => (
  <Editor initial={htmlParser(`Text<br/>with<br/>breaks`)} />
);
export const Paragraphs = () => (
  <Editor
    initial={htmlParser(`<p>First paragrpah</p><p>second paragrapj</p>`)}
  />
);

function Editor({ initial }: { initial: RaisinNode }) {
  const [state, setState] = useState<RaisinProseState>({
    node: initial,
    selection: undefined,
  });

  return (
    <div>
      <ControlledProseEditor {...{ state, setState }} />
      <hr />Here is my state:
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
