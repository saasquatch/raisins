import { useAtom } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import React from 'react';
import { CanvasProvider, CanvasScopedMolecule } from './CanvasScopedMolecule';

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
      <BasicCanvasController />
    </CanvasProvider>
  );
}

// No props allowed -- should all come from context, or atoms
export function BasicCanvasController() {
  // TODO: Forward ref?
  return <div ref={useCanvas()}></div>;
}
