import { isElementNode, RaisinDocumentNode } from '@raisins/core';
import { atom } from 'jotai';
import React, { createContext, useContext, useMemo } from 'react';
import { h, VNode, VNodeStyle } from 'snabbdom';
import { dependentAtom } from '../atoms/dependentAtom';
import {
  DropPloppedNodeInSlotAtom,
  PickedNodeAtom,
  PloppingIsActive,
} from '../atoms/pickAndPlopAtoms';
import { GetSoulAtom, soulToString } from '../atoms/Soul';
import { ComponentModelAtom } from '../component-metamodel/ComponentModel';
import { ParentsAtom, RootNodeAtom } from '../hooks/CoreAtoms';
import {
  IdToSoulAtom,
  SoulIdToNodeAtom,
  SoulToNodeAtom,
} from '../hooks/SoulsInDocumentAtoms';
import { SelectedNodeAtom, SelectedSoulAtom } from '../selection/SelectedAtom';
import { NPMRegistryAtom } from '../util/NPMRegistry';
import { HoveredAtom, HoveredSoulAtom } from './CanvasHoveredAtom';
import { CanvasScriptsAtom } from './CanvasScriptsAtom';
import { defaultRectAtom } from './defaultRectAtom';
import {
  raisintoSnabdom,
  SnabdomAppender,
  SnabdomRenderer,
} from './raisinToSnabdom';
import { Rect } from './Rect';
import { createAtoms } from './SnabbdomSanboxedIframeAtom';
import { CanvasEvent, GeometryDetail } from './_CanvasRPCContract';

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
  const souls = get(GetSoulAtom);
  const isPloppingActive = get(PloppingIsActive);
  const pickedNode = get(PickedNodeAtom);
  const metamodel = get(ComponentModelAtom);
  const parents = get(ParentsAtom);

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

    const soul = souls(n);
    return {
      ...d,
      attrs: {
        ...d.attrs,
        'raisins-soul': soul.toString(),
        'raisins-events': true,
      },
      style,
      props: propsToRender,
    };
  };

  const appender: SnabdomAppender = (c, n) => {
    // 0 - infer plop targets from slot names and metamodel
    // 1 - only render appropriate plop targets
    // 2 - render pretty plop targets (See Head atom)
    // 3 - add appropriate attrs to make `onClick` work (and rewrite select-on-click stuff)
    if (!pickedNode || !isElementNode(pickedNode)) return c;
    if (!isPloppingActive || !isElementNode(n)) return c;
    const parent = n;

    // TODO: Root node should allow any children
    if (!isElementNode(parent)) return c;

    const slot = n.attribs.slot ?? '';
    const isValid = metamodel.isValidChild(pickedNode, parent, slot);
    if (!isValid) return c;
    const soulId = souls(parent).toString();

    const newChildren =
      c?.reduce((acc, child, idx) => {
        const plopTarget = createPlopTargetNode({ idx, slot, soulId });
        return [...acc, plopTarget, child];
      }, [] as Array<string | VNode>) ?? [];
    return newChildren;
  };
  const vnode = raisintoSnabdom(node as RaisinDocumentNode, renderer, appender);

  return vnode;
});
VnodeAtom.debugLabel = 'VnodeAtom';

function createPlopTargetNode({
  soulId,
  slot,
  idx,
}: {
  idx: number;
  soulId: string;
  slot: string;
}) {
  return h(
    'div',
    {
      attrs: {
        slot,
        'raisin-plop-target': true,
        'raisin-plop-parent': soulId,
        'raisin-plop-slot': slot,
        'raisin-plop-idx': idx,
        'raisins-events': true,
      },
    },
    'Plop here'
  );
}

function createCanvasAtoms() {
  // TODO: Path might not be the right thing to depend on. Might be worth switching ID
  const HoveredRectAtom = dependentAtom<Rect | undefined>(
    HoveredSoulAtom,
    undefined
  );
  const SelectedRectAtom = dependentAtom<Rect | undefined>(
    SelectedSoulAtom,
    undefined
  );

  const CanvasEventAtom = atom(
    null,
    (get, set, { target, type }: CanvasEvent) => {
      const idToSoul = get(IdToSoulAtom);
      if (type === 'click') {
        const plopParentSoulId = target?.attributes['raisin-plop-parent'];
        if (plopParentSoulId) {
          const parentSoul = plopParentSoulId
            ? idToSoul(plopParentSoulId)
            : undefined;
          if (!parentSoul) return;
          const soulToNode = get(SoulToNodeAtom);
          const parentNode = soulToNode(parentSoul);
          if (!parentNode || !isElementNode(parentNode)) return;
          const idx = Number(target?.attributes['raisin-plop-idx']);
          const slot = target?.attributes['raisin-plop-slot'];
          set(DropPloppedNodeInSlotAtom, { parent: parentNode, idx, slot });
          // If plop, don't do select logic
          return;
        }

        const soulId = target?.attributes['raisins-soul'];
        if (soulId) {
          const soul = soulId ? idToSoul(soulId) : undefined;
          set(SelectedSoulAtom, soul);
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
      }
      if (type === 'mouseover') {
        const soulId = target?.attributes['raisins-soul'];
        const soul = soulId ? idToSoul(soulId) : undefined;
        set(HoveredSoulAtom, soul);
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

  const ResizeAtom = atom(null, (get, set, geometry: GeometryDetail) => {
    const selected = get(SelectedNodeAtom);
    const hovered = get(HoveredAtom);
    const getNode = get(SoulIdToNodeAtom);
    geometry.entries.forEach((e) => {
      const id = e.target?.attributes['raisins-soul'];
      const node = id && getNode(id);
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
  });

  const IframeAtom = createAtoms({
    head: IframeHeadAtom,
    registry: NPMRegistryAtom,
    selector: atom('[raisins-events]'),
    vnodeAtom: VnodeAtom,
    onEvent: CanvasEventAtom,
    onResize: ResizeAtom,
  });

  return {
    HoveredRectAtom: defaultRectAtom(IframeAtom, HoveredAtom, HoveredRectAtom),
    SelectedRectAtom: defaultRectAtom(
      IframeAtom,
      SelectedNodeAtom,
      SelectedRectAtom
    ),
    CanvasEventAtom,
    IframeAtom,
  };
}

const IframeHeadAtom = atom((get) => {
  const script = get(CanvasScriptsAtom);
  const styles = `<style>
    [raisin-plop-target]{
      background: yellow;

    }
    [raisin-plop-target]:hover{
      outline: 1px solid red;
    }
  </style>
  `;
  return script + styles;
});

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
