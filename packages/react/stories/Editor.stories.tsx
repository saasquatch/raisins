import { Meta } from '@storybook/react';
import React, { useState } from 'react';
import { RaisinsProvider } from '../src/atoms/RaisinScope';
import { CanvasController } from '../src/canvas/CanvasController';
import { EditorView } from '../src/views/EditorView';
import { useHotkeys } from '../src/hooks/useHotkeys';
import { Layers } from '../src/views/Layers';

const meta: Meta = {
  title: 'Editor',
  component: Editor,
};
export default meta;

export function Span() {
  const stateTuple = useState(
    `<span>I am a thing with <b>bold content</b></span>`
  );
  return (
    <RaisinsProvider state={stateTuple}>
      <Editor />
    </RaisinsProvider>
  );
}

export function Big() {
  const stateTuple = useState(big);
  return (
    <>
      <RaisinsProvider state={stateTuple}>
        <Editor />
      </RaisinsProvider>
      <pre>{stateTuple[0]}</pre>
    </>
  );
}

export function CanvasOnly() {
  const stateTuple = useState(big);
  return (
    <>
      <RaisinsProvider state={stateTuple}>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '50%' }}>
            <CanvasController />
          </div>
          <pre style={{ width: '50%' }}>{stateTuple[0]}</pre>
        </div>
      </RaisinsProvider>
    </>
  );
}

export function LayersOnly() {
  const stateTuple = useState(big);
  return (
    <>
      <RaisinsProvider state={stateTuple}>
        <div style={{ display: 'flex' }}>
          <Layers />
          <pre style={{ width: '50%' }}>{stateTuple[0]}</pre>
        </div>
      </RaisinsProvider>
    </>
  );
}
function Editor() {
  useHotkeys();

  return <EditorView />;
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
