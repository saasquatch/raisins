import { Component, h } from '@stencil/core';
import { Model } from '../../model/Dom';
import { Canvas } from '../../views/Canvas';
import { Layers } from '../../views/Layers';
import { withHooks } from '@saasquatch/stencil-hooks';
import { ToolbarView } from '../../views/Toolbar';
import { css } from '@emotion/css';
import { useEditor } from './useEditor';
import { EditorPanel } from '../../views/EditorPanel';
import serializer from '../../model/serializer';
import BlocksList from '../../views/BlocksList';

const Row = css`
  display: flex;
  flex-direction: row;
  flex-wrap: no-wrap;
  width: 100%;
`;

const Column = css`
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
`;

@Component({
  tag: 'raisin-editor',
})
export class Editor {
  constructor() {
    withHooks(this);
  }

  disconnectedCallback() {}

  render() {
    const model: Model = useEditor();

    const serialized = serializer(model.node);
    // console.log("Top-level render", new Date())
    return (
      <div>
        <ToolbarView {...model} />
        <div class={Row}>
          <div class={Column}>
            <Canvas {...model} />
          </div>

          <div class={Column} style={{ flexBasis: '400px', maxWidth: '400px' }}>
            {' '}
            <Layers {...model} />
            {/* <h1>Editor</h1>
            <EditorPanel {...model} />
            <BlocksList {...model} />
            <h1>Input</h1>
            <pre style={{ wordWrap: 'break-word' }}>{model.initial}</pre>
            <h1>Output</h1>
            <pre style={{ wordWrap: 'break-word' }}>{serialized}</pre> */}
          </div>
        </div>

        <slot />
      </div>
    );
  }
}
