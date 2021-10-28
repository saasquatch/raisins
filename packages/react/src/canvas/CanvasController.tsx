import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React from 'react';
import useCanvas, { SizeAtom } from './useCanvas';
import { SelectedAtom } from "../selection/SelectedAtom";
import { WYSWIGCanvas, WYSWIGCanvasProps } from '../views/CanvasView';

export function useWYSIWYGCanvas(): WYSWIGCanvasProps {
  const frameProps = useCanvas();
  const size = useAtomValue(SizeAtom);
  const setSelected = useUpdateAtom(SelectedAtom);

  return {
    setHtmlRef: (el) => {
      frameProps.containerRef.current = el!;
    },
    clearSelected: () => setSelected(undefined as any),
    size,
  };
}

// No props allowed -- should all come from context, or atoms
export function CanvasController() {
  return <WYSWIGCanvas {...useWYSIWYGCanvas()} />;
}
