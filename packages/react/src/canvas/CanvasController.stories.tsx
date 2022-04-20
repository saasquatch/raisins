import { useMolecule } from 'jotai-molecules';
import React from 'react';
import { big, MintComponents, mintMono } from '../examples/MintComponents';
import { BasicStory } from '../index.stories';
import { example } from '../node/children/LoadTest.example';
import { BasicCanvasController, CanvasController } from './CanvasController';
import { CanvasHoveredMolecule } from './CanvasHoveredMolecule';
import { CanvasProvider } from './CanvasScopedMolecule';
import { CanvasSelectionMolecule } from './CanvasSelectionMolecule';

export default {
  title: 'Canvas Controller',
};

export const LoadTest = () => {
  return (
    <BasicStory startingHtml={example}>
      <CanvasController />
    </BasicStory>
  );
};

const CanvasWithHover = () => {
  useMolecule(CanvasHoveredMolecule);
  return <BasicCanvasController />;
};
const CanvasWithSelection = () => {
  useMolecule(CanvasSelectionMolecule);
  return <BasicCanvasController />;
};
export const BigCanvasWithHover = () => (
  <BigCanvasOnly Component={CanvasWithHover} />
);
export const BigCanvasWithSelection = () => (
  <BigCanvasOnly Component={CanvasWithSelection} />
);
export const BigCanvasOnly = ({ Component = BasicCanvasController }) => (
  <BasicStory startingHtml={big}>
    <div style={{ display: 'flex' }}>
      <div style={{ width: '50%' }}>
        <CanvasProvider>
          <Component />
        </CanvasProvider>
      </div>
      <div style={{ width: '50%' }}>
        <CanvasProvider>
          <Component />
        </CanvasProvider>
      </div>
    </div>
  </BasicStory>
);
export const MintCanvasOnly = () => (
  <BasicStory startingHtml={mintMono} startingPackages={MintComponents}>
    <div style={{ display: 'flex' }}>
      <div style={{ width: '50%' }}>
        <CanvasController />
      </div>
      <div style={{ width: '50%' }}>
        <CanvasController />
      </div>
    </div>
  </BasicStory>
);
