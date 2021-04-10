import { useEffect, useMemo, useRef, useState } from '@saasquatch/universal-hooks';
import { RaisinNode } from '../../model/RaisinNode';
import { VirtualElement } from '@popperjs/core';
import flip from '@popperjs/core/lib/modifiers/flip';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import { sameWidth } from './sameWidth';
import { StateUpdater } from '../../model/EditorModel';
import { usePopper } from '../../model/usePopper';
import { getRectOffset } from '@interactjs/modifiers/Modification';

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

function useVirtualRef() {
  const ref = useRef<HTMLElement>(undefined);

  const virtualElement = useMemo(() => {
    const ve: VirtualElement = {
      getBoundingClientRect() {
        return (
          ref.current?.getBoundingClientRect() || {
            bottom: 0,
            height: 0,
            left: 0,
            right: 0,
            top: 0,
            width: 0,
          }
        );
      },
      get contextElement() {
        return ref.current;
      },
    };
    return ve;
  }, []);

  return {
    ref,
    virtualElement,
  };
}

const refToInlinEditor = new WeakMap<HTMLElement, unknown>();
export default function useCanvas(props: { selected: RaisinNode; setNodeInternal: StateUpdater<RaisinNode> }) {
  const [size, setSize] = useState<Size>(sizes[0]);

  const { ref, virtualElement } = useVirtualRef();

  const toolbarRef = useRef<HTMLElement>(undefined);
  const toolbarPopper = usePopper(virtualElement, toolbarRef.current, {
    modifiers: [flip, preventOverflow, sameWidth],
    placement: 'top-start',
  });

  const editorRef = useRef<HTMLElement>(undefined);
  const editorPopper = usePopper(virtualElement, toolbarRef.current, {
    modifiers: [flip, preventOverflow],
    placement: 'bottom-start',
  });

  function registerRef(node: RaisinNode, element: HTMLElement) {
    if (node === props.selected && element) {
      // Check for infinite loop
      if (ref.current !== element) {
        ref.current = element;
        editorPopper.update();
        toolbarPopper.update();
      }

      // if (refToInlinEditor.has(element)) {
      //   return;
      // }
      // // See TinyMCE React
      // // Stolen from: https://github.com/tinymce/tinymce-react/blob/c2072fe6ef840a1a90a19c48e32855223bff2e0d/src/main/ts/components/Editor.tsx#L191
      // var dfreeHeaderConfig = {
      //   selector: undefined,
      //   target: element,
      //   menubar: false,
      //   inline: true,
      //   toolbar: false,
      //   plugins: ['quickbars'],
      //   quickbars_insert_toolbar: 'undo redo',
      //   quickbars_selection_toolbar: 'italic underline',
      //   setup: editor => {
      //     editor.on('change keyup setcontent', e => console.log('Editor change event', e));
      //   },
      // };
      // // @ts-ignore
      // const newEditor = tinymce.init(dfreeHeaderConfig);
      // console.log('New INline Editor', newEditor.then(console.log));
      // refToInlinEditor.set(element, newEditor);
    }
  }
  useEffect;

  return {
    toolbarRef,
    toolbarPopper,
    editorRef,
    editorPopper,
    registerRef,
    sizes,
    size,
    setSize,
  };
}
