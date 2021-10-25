import { RaisinDocumentNode } from '@raisins/core';
import { atom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { h, VNode, VNodeStyle } from 'snabbdom';
import { moduleDetailsToScriptSrc } from '../component-metamodel/convert/moduleDetailsToScriptSrc';
import {
  LocalURLAtom,
  ModuleDetailsAtom,
} from '../component-metamodel/useComponentModel';
import { raisintoSnabdom } from '../hooks/raisinToSnabdom';
import {
  getId,
  RootNodeAtom,
  SelectedNodeAtom,
  SetSelectedIdAtom,
} from '../hooks/useCore';
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

export const sizes: Size[] = [
  { name: 'Auto', width: 'auto', height: 1080 },
  { name: 'Large', width: '992px', height: 1080 },
  { name: 'Medium', width: '768px', height: 1080 },
  { name: 'Small', width: '576px', height: 1080 },
  { name: 'X-Small', width: '400px', height: 1080 },
];

const HeadAtom = atom((get) => {
  const localUrl = get(LocalURLAtom);
  const moduleDetails = get(ModuleDetailsAtom);
  return moduleDetailsToScriptSrc(moduleDetails, localUrl);
});

function useInnerHtmlIframeRenderer() {
  const renderer = (
    iframe: HTMLIFrameElement,
    child: ChildRPC,
    Comp: VNode
  ): void => {
    if (!Comp) return; // no Component yet

    child.render(Comp);
  };

  const setSelectedId = useUpdateAtom(SetSelectedIdAtom);
  const onClick = (id: string) => setSelectedId(id);

  const head = useAtomValue(HeadAtom);
  const props = useSandboxedIframeRenderer<VNode>({
    renderer,
    initialComponent: h('div', {}),
    onClick,
    head,
  });

  return {
    renderInIframe: props.renderInIframe,
    containerRef: props.container,
  };
}

export const OutlineAtom = atom(true);
export const ModeAtom = atom<Mode>('edit');
export const SizeAtom = atom<Size>(sizes[0]);

const VnodeAtom = atom((get) => {
  const mode = get(ModeAtom);
  const selected = get(SelectedNodeAtom);
  const outlined = get(OutlineAtom);
  const node = get(RootNodeAtom);

  const vnode = raisintoSnabdom(node as RaisinDocumentNode, (d, n) => {
    if (mode === 'preview') {
      return d;
    }
    const { delayed, remove, ...rest } = d.style || {};
    const style: VNodeStyle = {
      ...rest,
      cursor: 'pointer',
      outline:
        n === selected
          ? '2px dashed rgba(255,0,0,0.5)'
          : outlined
          ? '1px dashed rgba(0,0,0,0.2)'
          : '',
      outlineOffset: n === selected ? '-2px' : '',
    };
    let propsToRender: Record<string, any> = {};

    return {
      ...d,
      attrs: {
        ...d.attrs,
        'raisins-id': getId(n),
        'raisins-thing': 'yes',
      },
      style,
      props: propsToRender,
    };
  });

  return vnode;
});

export default function useCanvas() {
  const frameProps = useInnerHtmlIframeRenderer();

  const vnode = useAtomValue(VnodeAtom);
  frameProps.renderInIframe(vnode);
  return {
    ...frameProps,
  };
}