import { Model } from '../src/model/EditorModel';
import { useEditor } from '../src/hooks/useEditor';
import { EditorView } from '../src/views/EditorView';
import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';
import { INTERNAL_CONTEXT } from '../src/hooks/useComponentModel';
import { RaisinNode } from '@raisins/core';
import { htmlParser } from '@raisins/core';
import ProseEditor from '../src/ProseEditor';
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
  <Editor
    initial={htmlParser(
      `Text<br/>with<br/>breaks`
    )}
  />
);
export const Paragraphs = () => (
  <Editor
    initial={htmlParser(`<p>First paragrpah</p><p>second paragrapj</p>`)}
  />
);

function Editor({ initial }: { initial: RaisinNode }) {
  const [state, setState] = useState<RaisinNode>(initial);

  return (
    <div>
      <ProseEditor node={state} setNode={setState} />
      <hr />I am a span editor
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
