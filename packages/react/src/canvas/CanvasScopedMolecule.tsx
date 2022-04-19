import { isElementNode } from '@raisins/core';
import { atom } from 'jotai';
import { createScope, molecule, ScopeProvider } from 'jotai-molecules';
import React from 'react';
import { HoveredNodeMolecule } from '../core/selection/HoveredNode';
import { PickedNodeMolecule } from '../core/selection/PickedNode';
import { SelectedNodeMolecule } from '../core/selection/SelectedNode';
import { SoulsMolecule } from '../core/souls/Soul';
import { SoulsInDocMolecule } from '../core/souls/SoulsInDocumentAtoms';
import { NPMRegistryAtom } from '../util/NPMRegistry';
import { CanvasEvent, GeometryDetail } from './api/_CanvasRPCContract';
import { CanvasConfigMolecule } from './CanvasConfig';
import { CanvasStyleMolecule } from './CanvasStyleMolecule';
import { defaultRectAtom } from './defaultRectAtom';
import { createAtoms } from './iframe/SnabbdomSanboxedIframeAtom';

const CanvasScope = createScope();

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  return (
    <ScopeProvider scope={CanvasScope} uniqueValue>
      {children}
    </ScopeProvider>
  );
}

export const CanvasScopedMolecule = molecule((getMol, getScope) => {
  getScope(CanvasScope);

  const CanvasOptions = getMol(CanvasConfigMolecule);
  const { VnodeAtom, IframeHeadAtom } = getMol(CanvasStyleMolecule);
  const { DropPloppedNodeInSlotAtom } = getMol(PickedNodeMolecule);
  const { HoveredNodeAtom, HoveredSoulAtom } = getMol(HoveredNodeMolecule);
  const { IdToSoulAtom, SoulToNodeAtom } = getMol(SoulsInDocMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);
  const { SelectedNodeAtom, SelectedSoulAtom } = getMol(SelectedNodeMolecule);

  const CanvasEventAtom = atom(
    null,
    (get, set, { target, type }: CanvasEvent) => {
      const idToSoul = get(IdToSoulAtom);
      const raisinsAttribute = get(CanvasOptions.SoulAttributeAtom);
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
          const slot = target?.attributes['raisin-plop-slot'] ?? '';
          set(DropPloppedNodeInSlotAtom, { parent: parentNode, idx, slot });
          // If plop, don't do select logic
          return;
        }

        const soulId = target?.attributes[raisinsAttribute];
        if (soulId) {
          const soul = soulId ? idToSoul(soulId) : undefined;
          set(SelectedSoulAtom, soul);
        }
      }
      if (type === 'mouseover') {
        const soulId = target?.attributes[raisinsAttribute];
        const soul = soulId ? idToSoul(soulId) : undefined;
        set(HoveredSoulAtom, soul);
      }
    }
  );

  const GeometryAtom = atom({ entries: [] } as GeometryDetail);
  const SetGeometryAtom = atom(null, (_, set, next: GeometryDetail) =>
    set(GeometryAtom, next)
  );

  const IframeAtom = createAtoms({
    head: IframeHeadAtom,
    registry: NPMRegistryAtom,
    selector: atom('[raisins-events]'),
    vnodeAtom: VnodeAtom,
    onEvent: CanvasEventAtom,
    onResize: SetGeometryAtom,
  });

  return {
    HoveredRectAtom: defaultRectAtom(
      GeometryAtom,
      HoveredNodeAtom,
      GetSoulAtom,
      CanvasOptions
    ),
    SelectedRectAtom: defaultRectAtom(
      GeometryAtom,
      SelectedNodeAtom,
      GetSoulAtom,
      CanvasOptions
    ),
    CanvasEventAtom,
    IframeAtom,
  };
});
