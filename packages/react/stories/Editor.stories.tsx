import { Model } from '../src/model/EditorModel';
import { useEditor } from '../src/hooks/useEditor';
import { EditorView } from '../src/views/EditorView';
import { Meta, Story } from '@storybook/react';

const meta: Meta = {
  title: 'Editor',
  component: Editor,
};
export default meta;

export function Editor() {
  const model: Model = useEditor(`
  <div style="--sl-color-primary-500: blue;">
  <sl-card class="card-overview"  style="--sl-color-primary-500: blue;">

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
`);

  return <EditorView {...model} />;
}
