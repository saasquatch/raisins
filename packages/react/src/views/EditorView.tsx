import React from 'react';
import { CanvasController } from '../canvas/CanvasController';
import { StyleEditor } from '../stylesheets/StyleEditor';
import { EditorPanel } from './EditorPanel';
import { Layers } from './Layers';
import { PackageEditorController } from './PackageEditorView';
import RichTextEditor from '../rich-text/RichTextEditor';
import { ToolbarView } from './Toolbar';
import styleToObject from 'style-to-object';

export const Row = `
  display: flex;
  flex-direction: row;
  flex-wrap: no-wrap;
  width: 100%;
`;

const Header = `
  grid-area: header;
`;
const Edits = `
  grid-area: edits;
`;
const CanvasCss = `
  grid-area: canvas;
`;
const LayersCss = `
  grid-area: layers;
`;

export const Main = `
  display: grid;
  grid-template-columns: 150px auto 150px;
  grid-template-rows: repeat(3, 100px);
  grid-gap: 1em;

  display: grid;
  grid-template-areas:
    'header header header'
    'layers canvas edits'
    'footer footer footer';
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 20% 1fr 15%;
  grid-row-gap: 10px;
  grid-column-gap: 10px;
  height: 100vh;
  margin: 0;

  overflow: hidden;
`;

export function EditorView() {
  return (
    <>
      <div style={styleToObject(Main)!}>
        <div style={styleToObject(Header)!}>
          <ToolbarView />
        </div>
        <div style={styleToObject(Edits)!}>
          <EditorPanel />
          <PackageEditorController />
          <StyleEditor />
        </div>
        <div style={styleToObject(CanvasCss)!}>
          <CanvasController />
          <CanvasController />
          <RichTextEditor />
        </div>

        <div style={styleToObject(LayersCss)!}>
          {' '}
          <Layers />
        </div>
      </div>
    </>
  );
}
