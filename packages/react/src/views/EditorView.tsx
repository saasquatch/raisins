import React, { CSSProperties } from 'react';
import { CanvasController } from '../canvas/CanvasController';
import { StyleEditor } from '../stylesheets/StyleEditor';
import { EditorPanel } from './EditorPanel';
import { Layers } from './Layers';
import { PackageEditorController } from './PackageEditorView';
import RichTextEditor from '../rich-text/RichTextEditor';
import { ToolbarView } from './Toolbar';

export const Row: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  width: '100%',
};

const Header: CSSProperties = {
  gridArea: 'header',
};
const Edits: CSSProperties = {
  gridArea: 'edits',
};
const CanvasCss: CSSProperties = {
  gridArea: 'canvas',
};
const LayersCss: CSSProperties = {
  gridArea: 'layers',
  overflowY: 'scroll',
};

export const Main: CSSProperties = {
  display: 'grid',
  gridGap: '1em',
  gridTemplateAreas: `
    'header header header'
    'layers canvas edits'
    'footer footer footer'`,
  gridTemplateRows: 'auto 1fr auto',
  gridTemplateColumns: '20% 1fr 15%',
  gridRowGap: '10px',
  gridColumnGap: '10px',
  height: '100vh',
  margin: '0',

  overflowY: 'hidden',
};

export function EditorView() {
  return (
    <>
      <div style={Main}>
        <div style={Header}>
          <ToolbarView />
        </div>
        <div style={Edits}>
          <EditorPanel />
          <PackageEditorController />
          <StyleEditor />
        </div>
        <div style={CanvasCss}>
          <CanvasController />
          <CanvasController />
          <RichTextEditor />
        </div>

        <div style={LayersCss}>
          {' '}
          <Layers />
        </div>
      </div>
    </>
  );
}
