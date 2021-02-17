import { useEffect, useRef, useState } from '@saasquatch/stencil-hooks';
import { RaisinNode } from '../../model/RaisinNode';
import { Instance } from '@popperjs/core/lib/types';
import { createPopper } from '@popperjs/core';
import flip from '@popperjs/core/lib/modifiers/flip';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import { sameWidth } from './sameWidth';

export default function useCanvas(props: { selected: RaisinNode }) {
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
  };
}
