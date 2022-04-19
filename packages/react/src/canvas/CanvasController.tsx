import { useAtom } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React from 'react';
import { SelectedNodeMolecule } from '../core/selection/SelectedNode';
import { CanvasProvider, CanvasScopedMolecule } from './CanvasScopedMolecule';
import { CanvasStyleMolecule } from './CanvasStyleMolecule';
import { WYSWIGCanvas, WYSWIGCanvasProps } from './CanvasView';

export function useWYSIWYGCanvas(): WYSWIGCanvasProps {
  const { SizeAtom } = useMolecule(CanvasStyleMolecule);
  const { SelectedAtom } = useMolecule(SelectedNodeMolecule);
  const atoms = useMolecule(CanvasScopedMolecule);
  const [_, setContainer] = useAtom(atoms.IframeAtom);
  const size = useAtomValue(SizeAtom);
  const setSelected = useUpdateAtom(SelectedAtom);

  return {
    setHtmlRef: setContainer,
    clearSelected: () => setSelected(undefined as any),
    size,
  };
}

function useCanvas() {
  const atoms = useMolecule(CanvasScopedMolecule);

  const [
    // Doesn't use the subscribed value, but triggers the subscribe to start
    _,
    setRef,
  ] = useAtom(atoms.IframeAtom);
  return setRef;
}

// No props allowed -- should all come from context, or atoms
export function CanvasController() {
  return (
    <CanvasProvider>
      <Container />
    </CanvasProvider>
  );
}
function Container() {
  return <div ref={useCanvas()}></div>;
}

function ExampleController() {
  return <WYSWIGCanvas {...useWYSIWYGCanvas()} />;
}
