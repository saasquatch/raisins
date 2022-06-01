import { Meta } from '@storybook/react';
import { atom, useAtom } from 'jotai';
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

  const ColorAtom = atom('pink');
  const TextAtom = atom('I am magic');
  const PaintItRed = atom<RootRenderer>((get) => {
    const color = get(ColorAtom);
    const text = get(TextAtom);
    return (n, d) => {
      return h(
        'div',
        {
          style: {
            display: 'block',
            padding: '20px',
            background: 'green',
            '--favorite-color': color,
          },
          shadowContent: `<div>${text}<hr/><slot></slot><hr/>${text}</div>`,
        },
        n
      );
    };
  });

  CanvasScope.RootRendererSet.add(PaintItRed);
  return { ColorAtom, TextAtom };
});

const ShadowPicker = () => {
  const atoms = useMolecule(PaintItRedMolecule);
  const [, setColor] = useAtom(atoms.ColorAtom);
  const [text, setText] = useAtom(atoms.TextAtom);
  return (
    <>
      {['pink', 'red', 'green'].map((c) => (
        <button onClick={() => setColor(c)}>{c}</button>
      ))}

      <hr />
      <input
        type="text"
        value={text}
        onInput={(e) => setText((e.target as HTMLInputElement).value)}
      />
    </>
  );
};

export const CanvasFull = () => {
  useMolecule(PaintItRedMolecule);
  useMolecule(CanvasHoveredMolecule);
  useMolecule(CanvasSelectionMolecule);

  return (
    <>
      <ShadowPicker />
      <div style={{ position: 'relative' }}>
        <BasicCanvasController />
      </div>
    </>
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
