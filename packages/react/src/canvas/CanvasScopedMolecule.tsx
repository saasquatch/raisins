import { RaisinDocumentNode } from '@raisins/core';
import { atom, WritableAtom } from 'jotai';
import { createScope, molecule, ScopeProvider } from 'jotai-molecules';
import { atomWithProxy } from 'jotai/valtio';
import React from 'react';
import { proxySet } from 'valtio/utils';
import { CoreMolecule, SoulsMolecule } from '../core';
import { NPMRegistryAtom } from '../util/NPMRegistry';
import { CanvasEvent, GeometryDetail } from './api/_CanvasRPCContract';
import { CanvasConfigMolecule } from './CanvasConfig';
import { CanvasScriptsMolecule } from './CanvasScriptsAtom';
import { createAtoms } from './iframe/SnabbdomSanboxedIframeAtom';
import {
  combineAppenders,
  combineRenderers,
  raisintoSnabdom,
  SnabdomRenderer,
} from './raisinToSnabdom';

const CanvasScope = createScope();

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  return (
    <ScopeProvider scope={CanvasScope} uniqueValue>
      {children}
    </ScopeProvider>
  );
}

type CanvasEventListener = WritableAtom<null, CanvasEvent>;

/**
 * A molecule used for tracking events and geometry for an iframe canvas.
 *
 * Must be used inside a {@link CanvasProvider}
 */
export const CanvasScopedMolecule = molecule((getMol, getScope) => {
  const value = getScope(CanvasScope);
  if (!value) throw new Error('Must be rendered in a <CanvasProvider/>');

  const CanvasConfig = getMol(CanvasConfigMolecule);
  const { EventSelectorAtom } = CanvasConfig;
  const CanvasOptions = getMol(CanvasConfigMolecule);
  const { RootNodeAtom } = getMol(CoreMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);
  const { CanvasScriptsAtom } = getMol(CanvasScriptsMolecule);

  const VnodeAtom = atom((get) => {
    const node = get(RootNodeAtom);
    const souls = get(GetSoulAtom);
    const raisinsSoulAttribute = get(CanvasOptions.SoulAttributeAtom);
    const renderersAtoms = get(CanvasOptions.RendererAtom);
    const renderers = Array.from(renderersAtoms.values()).map(
      (a) => get(a) as SnabdomRenderer
    );
    const eventsRenderer: SnabdomRenderer = (d, n) => {
      const soul = souls(n);
      return {
        ...d,
        attrs: {
          ...d.attrs,
          [raisinsSoulAttribute]: soul.toString(),
          'raisins-events': true,
        },
      };
    };
    const renderer = combineRenderers(eventsRenderer, ...renderers);

    const appenders = Array.from(get(CanvasOptions.AppendersAtom)).map((a) =>
      get(a)
    );
    const appender = combineAppenders(...appenders);

    const vnode = raisintoSnabdom(
      node as RaisinDocumentNode,
      renderer,
      appender
    );

    return vnode;
  });
  VnodeAtom.debugLabel = 'VnodeAtom';

  const canvasListeners = proxySet<CanvasEventListener>([]);
  function addListenerAtom(listener: CanvasEventListener) {
    canvasListeners.add(listener);
  }
  function removeListenerAtom(listener: CanvasEventListener) {
    canvasListeners.delete(listener);
  }

  const CanvasEventAtom = atom(null, (_, set, e: CanvasEvent) => {
    for (const listener of canvasListeners.values()) {
      set(listener, e);
    }
  });

  const GeometryAtom = atom({ entries: [] } as GeometryDetail);
  const SetGeometryAtom = atom(null, (_, set, next: GeometryDetail) =>
    set(GeometryAtom, next)
  );

  const IframeHeadAtom = atom((get) => {
    const script = get(CanvasScriptsAtom);
    const extra = CanvasConfig.IframeHead ? get(CanvasConfig.IframeHead) : '';
    return script + extra;
  });

  const IframeAtom = createAtoms({
    head: IframeHeadAtom,
    registry: NPMRegistryAtom,
    selector: EventSelectorAtom,
    vnodeAtom: VnodeAtom,
    onEvent: CanvasEventAtom,
    onResize: SetGeometryAtom,
  });

  return {
    addListenerAtom,
    removeListenerAtom,
    GeometryAtom,
    IframeAtom,
  };
});
