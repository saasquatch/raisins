import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React from 'react';
import useCanvas, { SizeAtom } from './useCanvas';
import { SelectedAtom } from "../selection/SelectedAtom";
import { WYSWIGCanvas, WYSWIGCanvasProps } from '../views/CanvasView';
import { RaisinScope } from '../atoms/RaisinScope';

export function useWYSIWYGCanvas(): WYSWIGCanvasProps {
  const frameProps = useCanvas();
  const size = useAtomValue(SizeAtom, RaisinScope);
  const setSelected = useUpdateAtom(SelectedAtom, RaisinScope);

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
