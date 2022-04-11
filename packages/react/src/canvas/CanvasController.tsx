import { useAtom } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React from 'react';
import { SelectedNodeMolecule } from '../core/selection/SelectedNode';
import { WYSWIGCanvas, WYSWIGCanvasProps } from '../views/CanvasView';
import { CanvasProvider, CanvasScopedMolecule } from './CanvasScopedMolecule';
import { CanvasStyleMolecule } from './CanvasStyleMolecule';

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

// No props allowed -- should all come from context, or atoms
export function CanvasController() {
  return (
    <CanvasProvider>
      <ExampleController />
    </CanvasProvider>
  );
}

function ExampleController() {
  return <WYSWIGCanvas {...useWYSIWYGCanvas()} />;
}
