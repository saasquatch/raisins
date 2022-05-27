import { Meta } from '@storybook/react';
import { atom } from 'jotai';
import { molecule, useMolecule } from 'jotai-molecules';
import React from 'react';
import { h } from 'snabbdom';
import { big, MintComponents, mintMono } from '../examples/MintComponents';
import { BasicStory } from '../index.stories';
import { CanvasProvider } from './CanvasScope';
import { CanvasScopeMolecule } from './CanvasScopeMolecule';
import { BasicCanvasController } from './index';
import { CanvasHoveredMolecule, CanvasSelectionMolecule } from './plugins';
import { RootRenderer } from './types';

const meta: Meta = {
  title: 'Canvas Templates',
  excludeStories: ['CanvasFull'],
};
export default meta;

const CanvasWithHover = () => {
  useMolecule(CanvasHoveredMolecule);
  return <BasicCanvasController />;
};
const CanvasWithSelection = () => {
  useMolecule(CanvasSelectionMolecule);
  return <BasicCanvasController />;
};

const PaintItRedMolecule = molecule((getMol, getScope) => {
  const CanvasScope = getMol(CanvasScopeMolecule);

  const PaintItRed = atom<RootRenderer>((get) => {
    return (n, d) => {
      return h(
        'my-entry',
        {
          style: {
            display: 'block',
            padding: '20px',
            background: 'green',
          },
          shadowContent: `<div>I am magic <hr/><slot></slot><hr/>More magic down here</div>`,
        },
        n
      );
    };
  });

  CanvasScope.RootRendererSet.add(PaintItRed);
});

export const CanvasFull = () => {
  useMolecule(PaintItRedMolecule);

  return (
    <div style={{ position: 'relative' }}>
      <BasicCanvasController />
    </div>
  );
};

export const BigCanvasFull = () => <BigCanvasOnly Component={CanvasFull} />;

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
      {/* <div style={{ width: '50%' }}>
        <CanvasProvider>
          <Component />
        </CanvasProvider>
      </div> */}
    </div>
  </BasicStory>
);

export const MintCanvasOnly = ({ Component = BasicCanvasController }) => (
  <BasicStory startingHtml={mintMono} startingPackages={MintComponents}>
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

export const MintCanvasFull = () => <MintCanvasOnly Component={CanvasFull} />;
