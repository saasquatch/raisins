import { Meta } from '@storybook/react';
import { Provider } from 'jotai';
import { LocalURLAtom } from '../src/hooks/useComponentModel';
import { useEditor } from '../src/hooks/useEditor';
import { Model } from '../src/model/EditorModel';
import { EditorView } from '../src/views/EditorView';

const meta: Meta = {
  title: 'Editor',
  component: Editor,
};
export default meta;

export function Span({ props }) {
  return (
    <Provider
      initialValues={[
        // Local atom
        [LocalURLAtom, 'http://localhost:5000'],
      ]}
    >
      <Editor html={`<span>I am a thing with <b>bold content</b></span>`} />
    </Provider>
  );
}

export function Big({ props }) {
  return (
    <Provider
      initialValues={[
        // Local atom
        [LocalURLAtom, 'http://localhost:5000'],
      ]}
    >
      <Editor html={big} />
    </Provider>
  );
}
function Editor({ html }: { html: string }) {
  const model: Model = useEditor(html);

  return <EditorView {...model} />;
}

const big = `
<div style="--sl-color-primary-600: pink;">
<my-component></my-component>
<my-split>
  <div slot="left">Left column</div>
  <div slot="right">Right column</div>
  <div slot="left">Left column 2</div>
  <div slot="right">Right column 2</div>
</my-split>
<sl-card class="card-overview"  style="--sl-color-primary-600: orange;">

<strong>Mittens</strong>
This kitten is as cute as he is playful. Bring him home today!
<small>6 weeks old</small>

<div slot="footer">
  <sl-button type="primary" pill>More Info</sl-button>
  <sl-rating></sl-rating>
</div>
</sl-card>
<sl-card class="card-overview">


<strong>Mittens</strong>
This kitten is as cute as he is playful. Bring him home today!
<small>6 weeks old</small>

<div slot="footer">
<sl-button type="primary" pill>More Info</sl-button>
<sl-rating></sl-rating>
</div>
</sl-card>
<sl-details summary="Toggle Me">
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</sl-details>
<template>
I am a template
</template>
</div>

<style>
.card-overview {
  max-width: 300px;
}

.card-overview small {
  color: var(--sl-color-gray-500);
}

.card-overview [slot="footer"] {
  display: flex; 
  justify-content: space-between; 
  align-items: center;
}
</style>
`;

Editor.args = {
  /**
   * Used for serving local packages
   */
  domain: 'https://localhost:5000',
};
