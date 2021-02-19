import { useEffect, useRef, useState } from '@saasquatch/stencil-hooks';
import { RaisinNode } from '../../model/RaisinNode';
import { Instance } from '@popperjs/core/lib/types';
import { createPopper } from '@popperjs/core';
import flip from '@popperjs/core/lib/modifiers/flip';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import { sameWidth } from './sameWidth';
import { StateUpdater } from '../../model/Dom';

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

const refToInlinEditor = new WeakMap<HTMLElement, unknown>();
export default function useCanvas(props: { selected: RaisinNode; setNodeInternal: StateUpdater<RaisinNode> }) {
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

      if (refToInlinEditor.has(element)) {
        return;
      }
      // See TinyMCE React
      // Stolen from: https://github.com/tinymce/tinymce-react/blob/c2072fe6ef840a1a90a19c48e32855223bff2e0d/src/main/ts/components/Editor.tsx#L191
      var dfreeHeaderConfig = {
        selector: undefined,
        target: element,
        menubar: false,
        inline: true,
        toolbar: false,
        plugins: ['quickbars'],
        quickbars_insert_toolbar: 'undo redo',
        quickbars_selection_toolbar: 'italic underline',
        setup: editor => {
          editor.on('change keyup setcontent', e => console.log('Editor change event', e));
        },
      };
      // @ts-ignore
      const newEditor = tinymce.init(dfreeHeaderConfig);
      console.log('New INline Editor', newEditor.then(console.log));
      refToInlinEditor.set(element, newEditor);
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
