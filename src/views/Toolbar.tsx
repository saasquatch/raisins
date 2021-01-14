import { h } from '@stencil/core';
import { Model } from '../model/Dom';

export function ToolbarView(props: Model) {
  return (
    <div>
      Toolbar
      <button onClick={() => props.undo()} disabled={!props.hasUndo}>Undo</button>
      <button onClick={() => props.redo()} disabled={!props.hasRedo}>Redo</button>
    </div>
  );
}
