import { useEffect, useRef, useState } from '@saasquatch/stencil-hooks';
import { RaisinNode } from '../../model/RaisinNode';
import { Instance } from '@popperjs/core/lib/types';
import { createPopper } from '@popperjs/core';
import flip from '@popperjs/core/lib/modifiers/flip';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import { sameWidth } from './sameWidth';

export type Size = {
  name: string;
  width: number;
  height: number;
};
const sizes: Size[] = [
  { name: 'HD', width: 1200, height: 1080 },
  { name: 'Large', width: 992, height: 1080 },
  { name: 'Medium', width: 768, height: 1080 },
  { name: 'Small', width: 576, height: 1080 },
  { name: 'X-Small', width: 400, height: 1080 },
];

export default function useCanvas(props: { selected: RaisinNode }) {
  const [size, setSize] = useState<Size>(sizes[0]);
  const [, setPopper] = useState<Instance>(undefined);
  const toolbarRef = useRef<HTMLElement>(undefined);

  function registerRef(node: RaisinNode, element: HTMLElement) {
    if (node === props.selected && element) {
      setPopper(previous => {
        const newPopper = createPopper(element, toolbarRef.current, {
          modifiers: [flip, preventOverflow, sameWidth],
          placement: 'top-start',
        });

        if (previous) {
          previous.destroy();
        }
        // TODO: use virtual element to prevent re-initialization costs and jump/jank?
        return newPopper;
      });
    }
  }
  useEffect;

  return {
    toolbarRef,
    registerRef,
    sizes,
    size,
    setSize,
  };
}
