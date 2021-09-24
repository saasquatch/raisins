import styled from 'styled-components';
import { RaisinElementNode } from '@raisins/core';
import '@shoelace-style/shoelace/dist/themes/dark.css';
import React from 'react';
import { Model } from '../model/EditorModel';
import { Canvas } from './Canvas';
import { EditorPanel } from './EditorPanel';
import { Layers } from './Layers';
import { StyleEditor } from './StyleEditor';
import { ToolbarView } from './Toolbar';

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: no-wrap;
  width: 100%;
`;

const Header = styled.div`
  grid-area: header;
`;
const Footer = styled.div`
  grid-area: footer;
`;
const Edits = styled.div`
  grid-area: edits;
`;
const CanvasCss = styled.div`
  grid-area: canvas;
`;
const LayersCss = styled.div`
  grid-area: layers;
`;

export const Main = styled.div`
  font-family: var(--sl-font-sans);
  font-size: var(--sl-font-size-medium);
  font-weight: var(--sl-font-weight-normal);
  letter-spacing: var(--sl-letter-spacing-normal);
  color: var(--sl-color-gray-800);
  line-height: var(--sl-line-height-normal);
  background: var(--sl-color-gray-900);
  color: var(--sl-color-gray-200);

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

  // Scrollbar colors: https://www.digitalocean.com/community/tutorials/css-scrollbars
  & > *::-webkit-scrollbar {
    width: 12px;
  }

  & > *::-webkit-scrollbar-track {
    background: var(--sl-color-gray-700);
  }

  & > *::-webkit-scrollbar-thumb {
    background-color: white;
    border-radius: 20px;
    border: 3px solid var(--sl-color-gray-700);
  }
  & > * {
    scrollbar-width: thin;
    scrollbar-color: white var(--sl-color-gray-700);
    overflow: auto;
  }
`;

export function EditorView(model: Model) {
  return (
    <>
      <Main>
        <Header>
          <ToolbarView {...model} />
        </Header>
        <Edits>
          <StyleEditor {...model} />
          {model.selected &&
            `Attributes for ${
              model.getComponentMeta(model.selected as RaisinElementNode)
                ?.title || 'Element'
            }`}
          <EditorPanel {...model} />
        </Edits>
        <CanvasCss>
          <Canvas {...model} />
        </CanvasCss>

        <LayersCss>
          {' '}
          <Layers {...model} />
        </LayersCss>
        <Footer>Footer</Footer>
      </Main>
    </>
  );
}
