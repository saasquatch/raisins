import { useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React from 'react';
import { RaisinScope } from '../core/RaisinScope';
import { SelectedAtom } from '../core/selection/SelectedNode';
import { WYSWIGCanvas, WYSWIGCanvasProps } from '../views/CanvasView';
import { CanvasProvider, SizeAtom, useCanvasAtoms } from './useCanvas';

export function useWYSIWYGCanvas(): WYSWIGCanvasProps {
  const atoms = useCanvasAtoms();
  const [_, setContainer] = useAtom(atoms.IframeAtom, RaisinScope);
  const size = useAtomValue(SizeAtom, RaisinScope);
  const setSelected = useUpdateAtom(SelectedAtom, RaisinScope);

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

export function ExampleController() {
  return <WYSWIGCanvas {...useWYSIWYGCanvas()} />;
}
