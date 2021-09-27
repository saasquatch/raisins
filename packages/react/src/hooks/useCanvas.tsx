import React, { useState } from 'react';
import { h, VNode, VNodeStyle } from 'snabbdom';
import { RaisinDocumentNode } from '../../../core/dist';
import { CoreModel } from '../model/EditorModel';
import { raisintoSnabdom } from './raisinToSnabdom';
import {
  ChildRPC,
  useSandboxedIframeRenderer,
} from './useSandboxedIframeRenderer';

export type Size = {
  name: string;
  width: string;
  height: number;
};

export type Mode = 'preview' | 'edit' | 'html';

const sizes: Size[] = [
  { name: 'Auto', width: 'auto', height: 1080 },
  { name: 'Large', width: '992px', height: 1080 },
  { name: 'Medium', width: '768px', height: 1080 },
  { name: 'Small', width: '576px', height: 1080 },
  { name: 'X-Small', width: '400px', height: 1080 },
];

function useInnerHtmlIframeRenderer(model: CoreModel, mode: Mode) {
  const renderer = (
    iframe: HTMLIFrameElement,
    child: ChildRPC,
    Comp: VNode
  ): void => {
    if (!Comp) return; // no Component yet


    child.render(Comp);
  };

  const onClick = (id: string) => model.setSelectedId(id);
  const props = useSandboxedIframeRenderer<VNode>({
    renderer,
    initialComponent: h("div",{}),
    onClick,
  });

  return {
    renderInIframe: props.renderInIframe,
    containerRef: props.container,
  };
}

export default function useCanvas(props: CoreModel) {
  const [mode, setMode] = useState<Mode>('edit');
  const frameProps = useInnerHtmlIframeRenderer(props, mode);
  const [size, setSize] = useState<Size>(sizes[0]);

  const vnode = raisintoSnabdom(props.node as RaisinDocumentNode, (d, n) => {
    if (mode === 'preview') {
      return d;
    }
    const { delayed, remove, ...rest } = d.style || {};
    const style: VNodeStyle = {
      ...rest,
      cursor: 'pointer',
      outline: n === props.selected ? '2px dashed rgba(255,0,0,0.5)' : '',
      outlineOffset: n === props.selected ? '-2px' : '',
    };
    return {
      ...d,
      attrs: {
        ...d.attrs,
        'raisins-id': props.getId(n),
      },
      style,
    };
  });

  frameProps.renderInIframe(vnode);
  return {
    sizes,
    size,
    setSize,
    mode,
    setMode,
    ...frameProps,
  };
}
