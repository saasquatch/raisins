import { RaisinDocumentNode } from '@raisins/core';
import { atom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import { h, VNodeStyle } from 'snabbdom';
import { PloppingIsActive } from '../atoms/pickAndPlopAtoms';
import { RaisinScope } from '../atoms/RaisinScope';
import { getId, RootNodeAtom } from '../hooks/CoreAtoms';
import { SelectedNodeAtom } from '../selection/SelectedAtom';
import {
  raisintoSnabdom,
  SnabdomAppender,
  SnabdomRenderer,
} from './raisinToSnabdom';
import { useIframeWithScriptsAndSelection } from './useIframeWithScriptsAndSelection';

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

export const OutlineAtom = atom(true);
export const ModeAtom = atom<Mode>('edit');
export const SizeAtom = atom<Size>(sizes[0]);

const VnodeAtom = atom((get) => {
  const mode = get(ModeAtom);
  const selected = get(SelectedNodeAtom);
  const outlined = get(OutlineAtom);
  const node = get(RootNodeAtom);
  const isPloppingActive = get(PloppingIsActive);

  const renderer: SnabdomRenderer = (d, n) => {
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
  };

  const appender: SnabdomAppender = (c, n) => {
    if (isPloppingActive) {
      // TODO:
      // 1 - only render appropriate plop targets
      // 2 - render pretty plop targets
      // 3 - add appropriate attrs to make `onClick` work (and rewrite select-on-click stuff)
      return [h('div', null, 'Plop here'), ...(Array.isArray(c) ? c : [])];
    }
    return c;
  };
  const vnode = raisintoSnabdom(node as RaisinDocumentNode, renderer, appender);

  return vnode;
});

export default function useCanvas() {
  /*
  Looks after wiring up an iframe with:
   - snabbdom for vdom rendering
   - penpal for cross-domain selection
  */
  const frameProps = useIframeWithScriptsAndSelection();

  /*
   * Atom only updates on changes
   */
  const vnode = useAtomValue(VnodeAtom, RaisinScope);

  /*
   * React render triggers snabbdom render
   */
  frameProps.renderInIframe(vnode);

  return {
    ...frameProps,
  };
}
