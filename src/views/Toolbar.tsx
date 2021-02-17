import { css } from '@emotion/css';
import { h } from '@stencil/core';
import { Model } from '../model/Dom';

const ToolbarStyle = css`
  padding: 10px;
`;
export function ToolbarView(props: Model) {
  const change = () => props.setMode(previous => (previous === 'preview' ? 'edit' : 'preview'));
  return (
    <div class={ToolbarStyle}>
      Toolbar
      <sl-button-group>
        <sl-button size="small" pill onClick={() => props.undo()} disabled={!props.hasUndo}>
          <sl-icon slot="prefix" name="arrow-90deg-left"></sl-icon>
          Undo
        </sl-button>
        <sl-button size="small" pill onClick={() => props.redo()} disabled={!props.hasRedo}>
          <sl-icon slot="prefix" name="arrow-90deg-right"></sl-icon>
          Redo
        </sl-button>
      </sl-button-group>
      <sl-button-group onClick={change}>
        <sl-button size="small" pill type={props.mode === 'edit' ? 'success' : 'default'}>
          <sl-icon slot="prefix" name="pencil"></sl-icon>
          Edit
        </sl-button>
        <sl-button size="small" pill type={props.mode === 'preview' ? 'success' : 'default'}>
          <sl-icon slot="prefix" name="eye"></sl-icon>
          Preview
        </sl-button>
      </sl-button-group>
      <sl-button-group>
        {props.sizes.map(s => (
          <sl-button size="small" pill onClick={() => props.setSize(s)} type={props.size === s ? 'success' : 'default'}>
            {s.name}
          </sl-button>
        ))}
      </sl-button-group>
    </div>
  );
}
