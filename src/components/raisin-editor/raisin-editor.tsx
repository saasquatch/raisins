import { Component, h } from '@stencil/core';
import { Model } from '../../model/EditorModel';
import { Canvas } from '../../views/Canvas';
import { Layers } from '../../views/Layers';
import { useHost, withHooks } from '@saasquatch/stencil-hooks';
import { ToolbarView } from '../../views/Toolbar';
import { css } from '@emotion/css';
import { useEditor } from './useEditor';
import { RaisinElementNode } from '../../model/RaisinNode';
import { EditorPanel } from '../../views/EditorPanel';
import { StyleEditor } from '../../views/StyleEditor';

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
const Main = css`
  font-family: var(--sl-font-sans);
  font-size: var(--sl-font-size-medium);
  font-weight: var(--sl-font-weight-normal);
  letter-spacing: var(--sl-letter-spacing-normal);
  color: var(--sl-color-gray-800);
  line-height: var(--sl-line-height-normal);
  background: var(--sl-color-gray-900);
  color: var(--sl-color-gray-200);
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
    const host = useHost();
    const model: Model = useEditor(host);

    // console.log("Top-level render", new Date())
    return (
      <sl-theme name="dark">
        <div class={Main}>
          <ToolbarView {...model} />
          <div class={Row}>
            <div class={Column} style={{ flexBasis: '400px', maxWidth: '400px', padding: '5px' }}>
              {model.selected && `Attributes for ${model.getComponentMeta(model.selected as RaisinElementNode)?.title || 'Element'}`}
              <EditorPanel {...model} />
              <StyleEditor {...model} />
            </div>
            <div class={Column} style={{ flexGrow: '1' }}>
              <Canvas {...model} />
            </div>

            <div class={Column} style={{ flexBasis: '600px', maxWidth: '600px' }}>
              {' '}
              <Layers {...model} />
              {/* <EditorPanel {...model} /> */}
              {/* <h1>Editor</h1>
         
            <BlocksList {...model} />
            <h1>Input</h1>
            <pre style={{ wordWrap: 'break-word' }}>{model.initial}</pre>
            <h1>Output</h1>
            <pre style={{ wordWrap: 'break-word' }}>{serialized}</pre> */}
            </div>
          </div>

          <slot />
        </div>
      </sl-theme>
    );
  }
}
