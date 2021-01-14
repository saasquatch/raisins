import { Component, Prop, h } from '@stencil/core';
import serialize from 'dom-serializer';
import { Model } from '../../model/Dom';
import { Canvas } from '../../views/Canvas';
import { Layers } from '../../views/Layers';
import { withHooks } from '@saasquatch/stencil-hooks';
import { ToolbarView } from '../../views/Toolbar';
import { css } from '@emotion/css';
import { useEditor } from './useEditor';

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
  /**
   * The first name
   */
  @Prop() html: string;

  constructor() {
    withHooks(this);
  }

  disconnectedCallback() {}

  render() {
    const model: Model = useEditor(this.html);

    const serialized = serialize(model.node);

    return (
      <div>
        <ToolbarView {...model} />
        <div class={Row}>
          <div class={Column} >
            <Canvas {...model} />
          </div>

          <div class={Column} style={{ flexBasis: "400px", maxWidth: "400px" }}>
            {' '}
            <Layers {...model} />
            <h1>Input</h1>
            <pre style={{wordWrap: "break-word"}}>{this.html}</pre>
            <h1>Output</h1>
            <pre style={{wordWrap: "break-word"}}>{serialized}</pre>
          </div>
        </div>
      </div>
    );
  }
}
