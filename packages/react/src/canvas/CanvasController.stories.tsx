import { Atom, useAtomValue } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import React from 'react';
import { big, MintComponents, mintMono } from '../examples/MintComponents';
import { BasicStory } from '../index.stories';
import { example } from '../node/children/LoadTest.example';
import {
  BasicCanvasController,
  CanvasController,
  CanvasHoveredMolecule,
  CanvasPickAndPlopMolecule,
  CanvasProvider,
  CanvasSelectionMolecule,
  Rect,
} from './index';

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
const CanvasFull = () => {
  useMolecule(CanvasSelectionMolecule);
  useMolecule(CanvasHoveredMolecule);
  useMolecule(CanvasPickAndPlopMolecule);
  return (
    <div style={{ position: 'relative' }}>
      <Toolbars />
      <BasicCanvasController />;
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
      <div style={{ width: '50%' }}>
        <CanvasProvider>
          <Component />
        </CanvasProvider>
      </div>
    </div>
  </BasicStory>
);

const Toolbars = () => {
  const { PickedRectAtom } = useMolecule(CanvasPickAndPlopMolecule);
  const { SelectedRectAtom } = useMolecule(CanvasSelectionMolecule);
  const { HoveredRectAtom } = useMolecule(CanvasHoveredMolecule);

  return (
    <>
      <PositionedToolbar rectAtom={HoveredRectAtom}>Hovered</PositionedToolbar>
      <PositionedToolbar rectAtom={SelectedRectAtom}>
        Selected
      </PositionedToolbar>
      <PositionedToolbar rectAtom={PickedRectAtom}>Picked</PositionedToolbar>
    </>
  );
};
const PositionedToolbar = ({
  rectAtom,
  children,
}: {
  rectAtom: Atom<Rect | undefined>;
  children: React.ReactNode;
}) => {
  const rect = useAtomValue(rectAtom);
  if (!rect)
    return (
      <div style={{ position: 'absolute', top: 0, left: 0, display: 'none' }} />
    );

  const { x, y, width, height } = rect;

  return (
    <div
      style={{
        background: 'green',
        color: 'white',
        position: 'absolute',
        top: y + height,
        left: x - 2,
        width: width + 'px',
        minWidth: '200px',
      }}
    >
      {children}
    </div>
  );
};

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
