import { RaisinDocumentNode, RaisinNode } from '@raisins/core';
import { Atom, atom } from 'jotai';
import React, { createContext, useContext, useMemo } from 'react';
import { h, VNodeStyle } from 'snabbdom';
import { dependentAtom } from '../atoms/dependentAtom';
import { PloppingIsActive } from '../atoms/pickAndPlopAtoms';
import { getId, idToNode, RootNodeAtom } from '../hooks/CoreAtoms';
import { SelectedAtom, SelectedNodeAtom, SetSelectedIdAtom } from '../selection/SelectedAtom';
import { NPMRegistryAtom } from '../util/NPMRegistry';
import { HoveredAtom, HoveredPath, SetHoveredIdAtom } from './CanvasHoveredAtom';
import { CanvasScriptsAtom } from './CanvasScriptsAtom';
import {
  raisintoSnabdom,
  SnabdomAppender,
  SnabdomRenderer,
} from './raisinToSnabdom';
import { Rect } from './Rect';
import { ConnectionState, createAtoms } from './SnabbdomSanboxedIframeAtom';
import { CanvasEvent } from './_CanvasRPCContract';

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

export const VnodeAtom = atom((get) => {
  const mode = get(ModeAtom);
  const selected = get(SelectedNodeAtom);
  const hovered = get(HoveredAtom);
  const outlined = get(OutlineAtom);
  const node = get(RootNodeAtom);
  const isPloppingActive = get(PloppingIsActive);

  const renderer: SnabdomRenderer = (d, n) => {
    if (mode === 'preview') {
      return d;
    }
    const isHovered = hovered === n;
    const isSelected = selected === n;
    const isOutlined = isHovered || isSelected;
    const { delayed, remove, ...rest } = d.style || {};
    const style: VNodeStyle = {
      ...rest,
      cursor: 'pointer',
      outline: isHovered
        ? '2px solid green'
        : isSelected
        ? '2px solid rgba(255,0,0,0.5)'
        : outlined
        ? '1px dashed rgba(0,0,0,0.2)'
        : '',
      outlineOffset: isOutlined ? '-2px' : '',
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
      // 0 - infer plop targets from slot names and metamodel
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
VnodeAtom.debugLabel = 'VnodeAtom';

function defaultRect(
  connection: Atom<ConnectionState>,
  nodeAtom: Atom<RaisinNode | undefined>,
  listenedPosition: Atom<Rect | undefined>
) {
  const rectAtom = atom(async (get) => {
    const node = get(nodeAtom);
    if (!node) return undefined;
    // When node changes, then lookup initial value
    const latest = get(listenedPosition);
    if (latest) return latest;

    const connState = get(connection);

    if (connState.type !== 'loaded') {
      return undefined;
    }

    const geometry = await connState.childRpc.geometry();

    const rect = geometry.entries.find(
      (e) => e.target?.attributes['raisins-id'] === getId(node)
    );

    return rect?.contentRect;
  });
  return rectAtom;
}

function createCanvasAtoms() {
  // TODO: Path might not be the right thing to depend on. Might be worth switching ID
  const HoveredRectAtom = dependentAtom<Rect | undefined>(HoveredPath,undefined);
  const SelectedRectAtom = dependentAtom<Rect | undefined>(SelectedAtom,undefined);

  const CanvasEventAtom = atom(
    null,
    (get, set, { target, type }: CanvasEvent) => {
      if (type === 'click') {
        set(SetSelectedIdAtom, target?.attributes['raisins-id']);
        if (target) {
          // TODO: This doesn't handle when selection is changed in different canvas
          // We need to "pull" the size on THIS canvas when selection is set on the OTHER canvas
          set(SelectedRectAtom, {
            x: target.rect.x,
            y: target.rect.y,
            height: target.rect.height,
            width: target.rect.width,
          });
        }
      }
      if (type === 'mouseover') {
        set(SetHoveredIdAtom, target?.attributes['raisins-id']);
        if (target) {
          // TODO: This doesn't handle when hover is changed in different canvas
          set(HoveredRectAtom, {
            x: target.rect.x,
            y: target.rect.y,
            height: target.rect.height,
            width: target.rect.width,
          });
        }
      }
    }
  );

  const IframeAtom = createAtoms({
    head: CanvasScriptsAtom,
    registry: NPMRegistryAtom,
    selector: atom('[raisins-id]'),
    vnodeAtom: VnodeAtom,
    onEvent: CanvasEventAtom,
    onResize: atom(null, (get, set, geometry) => {
      geometry.entries.forEach((e) => {
        const selected = get(SelectedNodeAtom);
        const hovered = get(HoveredAtom);
        const id = e.target?.attributes['raisins-id'];
        const node = id && idToNode.get(id);
        if (node && node === selected) {
          set(SelectedRectAtom, {
            x: e.contentRect.x,
            y: e.contentRect.y,
            height: e.contentRect.height,
            width: e.contentRect.width,
          });
        }
        if (node && node === hovered) {
          set(HoveredRectAtom, {
            x: e.contentRect.x,
            y: e.contentRect.y,
            height: e.contentRect.height,
            width: e.contentRect.width,
          });
        }
      });
    }),
  });

  return {
    HoveredRectAtom: defaultRect(IframeAtom, HoveredAtom, HoveredRectAtom),
    SelectedRectAtom: defaultRect(
      IframeAtom,
      SelectedNodeAtom,
      SelectedRectAtom
    ),
    CanvasEventAtom,
    IframeAtom,
  };
}

export const CanvasContext = createContext<
  undefined | ReturnType<typeof createCanvasAtoms>
>(undefined);

export function useCanvasAtoms() {
  const atoms = useContext(CanvasContext);
  if (!atoms)
    throw new Error(
      'No CanvasContext found. Make sure you wrap your component in a <CanvasProvider> component.'
    );
  return atoms;
}

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const atoms = useMemo(createCanvasAtoms, []);
  return (
    <CanvasContext.Provider value={atoms}>{children}</CanvasContext.Provider>
  );
}
