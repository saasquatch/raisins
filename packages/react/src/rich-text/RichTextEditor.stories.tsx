import { htmlParser, RaisinNode } from '@raisins/core';
import { Meta } from '@storybook/react';
import React from 'react';
import { BasicStory } from '../index.stories';
import { NodeRichTextController } from './RichTextEditor';
const meta: Meta = {
  title: 'Rich Text (Prose) Editor',
};
export default meta;

const span: RaisinNode = htmlParser(
  `A bunch of text nodes with <b>inline content</b> and <a href="example">links</a>`
);

export const Span = () => (
  <BasicStory
    startingHtml={`A bunch of text nodes with <b>inline content</b> and <a href="example">links</a>`}
  >
    <AtomEditor />
  </BasicStory>
);

export const TextWithBreaks = () => (
  <BasicStory startingHtml={`Text<br/>with<br/>breaks`}>
    <AtomEditor />
  </BasicStory>
);
export const Paragraphs = () => (
  <BasicStory startingHtml={`<p>First paragrpah</p><p>second paragrapj</p>`}>
    <AtomEditor />
  </BasicStory>
);

function AtomEditor() {
  return (
    <div>
      <NodeRichTextController />
    </div>
  );
}
