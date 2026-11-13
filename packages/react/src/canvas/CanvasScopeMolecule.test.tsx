import { renderHook } from '@testing-library/react';
import { molecule, useMolecule } from 'bunshi/react';
import { expect } from 'vitest';
import { atom } from 'jotai';
import React from 'react';
import { type Module } from '../component-metamodel/types.ts';
import { type RaisinConfig, RaisinsProvider } from '../core/RaisinConfigScope.tsx';
import { CanvasProvider } from './CanvasScope.tsx';
import { CanvasScopeMolecule } from './CanvasScopeMolecule.tsx';
import { CanvasHoveredMolecule } from './plugins/CanvasHoveredMolecule.ts';
import { CanvasPickAndPlopMolecule } from './plugins/CanvasPickAndPlopMolecule.tsx';
import { CanvasSelectionMolecule } from './plugins/CanvasSelectionMolecule.tsx';

function renderCanvasPlugins() {
  const StoryMolecule = molecule<Partial<RaisinConfig>>(() => ({
    HTMLAtom: atom('<p>hi</p>'),
    PackagesAtom: atom([] as Module[]),
  }));
  const Wrapper: React.FC = ({ children }) => (
    <RaisinsProvider molecule={StoryMolecule}>
      <CanvasProvider>{children}</CanvasProvider>
    </RaisinsProvider>
  );
  return renderHook(
    () => {
      useMolecule(CanvasHoveredMolecule);
      useMolecule(CanvasSelectionMolecule);
      useMolecule(CanvasPickAndPlopMolecule);
      const canvas = useMolecule(CanvasScopeMolecule);
      return {
        canvas,
        sizes: {
          appenders: canvas.AppendersSet.size,
          renderers: canvas.RendererSet.size,
          html: canvas.HTMLSet.size,
          clickListeners: canvas.ListenersMap.get('click')?.size,
          mouseoverListeners: canvas.ListenersMap.get('mouseover')?.size,
        },
      };
    },
    { wrapper: Wrapper }
  );
}

describe('CanvasScopeMolecule registration', () => {
  it('registers canvas plugins once across re-renders', () => {
    const { result, rerender } = renderCanvasPlugins();
    const firstSizes = result.current.sizes;

    rerender();
    rerender();
    rerender();

    expect(firstSizes).toEqual({
      appenders: 1,
      renderers: 3,
      html: 1,
      clickListeners: 2,
      mouseoverListeners: 1,
    });
    expect(result.current.sizes).toEqual(firstSizes);
  });

  it('runs registerOnce once per owner', () => {
    const { result } = renderCanvasPlugins();
    const { registerOnce } = result.current.canvas;
    const owner = {};
    let calls = 0;

    registerOnce(owner, () => calls++);
    registerOnce(owner, () => calls++);
    registerOnce({}, () => calls++);

    expect(calls).toBe(2);
  });
});
