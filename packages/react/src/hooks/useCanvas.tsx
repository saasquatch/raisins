import { useAtomValue } from 'jotai/utils';
import React, { useContext, useMemo, useState } from 'react';
import { h, VNode, VNodeStyle } from 'snabbdom';
import { RaisinDocumentNode } from '../../../core/dist';
import { CoreModel } from '../model/EditorModel';
import unpkgNpmRegistry, { makeLocalRegistry } from '../util/NPMRegistry';
import { isElementNode } from '../views/isNode';
import { raisintoSnabdom } from './raisinToSnabdom';
import { ComponentModel, LocalURLAtom } from './useComponentModel';
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

function useInnerHtmlIframeRenderer(model: CoreModel & ComponentModel) {
  const renderer = (
    iframe: HTMLIFrameElement,
    child: ChildRPC,
    Comp: VNode
  ): void => {
    if (!Comp) return; // no Component yet

    child.render(Comp);
  };

  const onClick = (id: string) => model.setSelectedId(id);

  let localUrl = useAtomValue(LocalURLAtom);

  const head = useMemo(() => {
    const scripts =
      model.moduleDetails?.map((m) => {
        const { module, browser, main, unpkg } = m['package.json'];
        // Use the prescribed file path, if not then module, browser, or main or empty
        const filePath = m.filePath ?? unpkg ?? module ?? browser ?? main ?? '';
        const useModule = filePath === module || filePath.endsWith('.esm.js');
        const isCss = m.filePath && m.filePath.endsWith('.css');
        // TODO: Centralize registry better
        let registry = unpkgNpmRegistry;
        if (m.name === '@local' && localUrl) {
          registry = makeLocalRegistry(localUrl);
        }
        if (isCss)
          return ` <link rel="stylesheet" href="${registry.resolvePath(
            m,
            m.filePath!
          )}" />`;
        return `<script src="${registry.resolvePath(m, filePath)}" ${
          useModule && `type="module"`
        }></script>`;
      }) ?? [];

    return scripts.join('\n');
  }, [model.moduleDetails]);

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

export type CanvasModel = {
  renderInIframe: (Component: VNode) => void;
  containerRef: React.MutableRefObject<HTMLElement | undefined>;
  sizes: Size[];
  size: Size;
  setSize: React.Dispatch<Size>;
  mode: Mode;
  setMode: React.Dispatch<Mode>;
  outlined: boolean;
  setOutlined: React.Dispatch<boolean>;
};

export default function useCanvas(
  props: CoreModel & ComponentModel
): CanvasModel {
  const [outlined, setOutlined] = useState<boolean>(true);
  const [mode, setMode] = useState<Mode>('edit');
  const frameProps = useInnerHtmlIframeRenderer(props);
  const [size, setSize] = useState<Size>(sizes[0]);

  const vnode = raisintoSnabdom(props.node as RaisinDocumentNode, (d, n) => {
    if (mode === 'preview') {
      return d;
    }
    const { delayed, remove, ...rest } = d.style || {};
    const style: VNodeStyle = {
      ...rest,
      cursor: 'pointer',
      outline:
        n === props.selected
          ? '2px dashed rgba(255,0,0,0.5)'
          : outlined
          ? '1px dashed rgba(0,0,0,0.2)'
          : '',
      outlineOffset: n === props.selected ? '-2px' : '',
    };
    let propsToRender: Record<string, any> = {};
    if (isElementNode(n)) {
      const meta = props.getComponentMeta(n);
      const demoLenght = meta.demoStates?.length ?? 0;
      if (demoLenght > 0) {
        // TODO: Allow a picker!
        propsToRender = meta.demoStates![0].props;
      }
    }

    return {
      ...d,
      attrs: {
        ...d.attrs,
        'raisins-id': props.getId(n),
        'raisins-thing': 'yes',
      },
      style,
      props: propsToRender,
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
    outlined,
    setOutlined,
  };
}
