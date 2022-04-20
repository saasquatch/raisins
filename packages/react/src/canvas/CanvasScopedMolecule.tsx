import { atom, WritableAtom } from 'jotai';
import { createScope, molecule, ScopeProvider } from 'jotai-molecules';
import React from 'react';
import { NPMRegistryAtom } from '../util/NPMRegistry';
import { CanvasEvent, GeometryDetail } from './api/_CanvasRPCContract';
import { CanvasConfigMolecule } from './CanvasConfig';
import { CanvasStyleMolecule } from './CanvasStyleMolecule';
import { createAtoms } from './iframe/SnabbdomSanboxedIframeAtom';

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
  const { VnodeAtom, IframeHeadAtom } = getMol(CanvasStyleMolecule);

  const canvasListeners = new Set<CanvasEventListener>();

  function addListenerAtom(listener: CanvasEventListener) {
    canvasListeners.add(listener);
  }
  function removeListenerAtom(listener: CanvasEventListener) {
    canvasListeners.delete(listener);
  }

  const CanvasEventAtom = atom(null, (get, set, e: CanvasEvent) => {
    for (const listener of canvasListeners.values()) {
      set(listener, e);
    }
  });

  const GeometryAtom = atom({ entries: [] } as GeometryDetail);
  const SetGeometryAtom = atom(null, (_, set, next: GeometryDetail) =>
    set(GeometryAtom, next)
  );

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
