import { isElementNode } from '@raisins/core';
import { atom } from 'jotai';
import { createScope, molecule, ScopeProvider } from 'jotai-molecules';
import React from 'react';
import { HoveredNodeMolecule } from '../core/selection/HoveredNode';
import { PickedNodeMolecule } from '../core/selection/PickedNode';
import { SelectedMolecule } from '../core/selection/SelectedNode';
import { SoulsMolecule } from '../core/souls/Soul';
import { SouldsInDocMolecule } from '../core/souls/SoulsInDocumentAtoms';
import { dependentAtom } from '../util/atoms/dependentAtom';
import { NPMRegistryAtom } from '../util/NPMRegistry';
import { Rect } from './api/Rect';
import { CanvasEvent, GeometryDetail } from './api/_CanvasRPCContract';
import { defaultRectAtom } from './defaultRectAtom';
import { createAtoms } from './SnabbdomSanboxedIframeAtom';
import { CanvasStyleMolecule } from './useCanvas';

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

  const { VnodeAtom, IframeHeadAtom } = getMol(CanvasStyleMolecule);
  const { DropPloppedNodeInSlotAtom } = getMol(PickedNodeMolecule);
  const { HoveredNodeAtom, HoveredSoulAtom } = getMol(HoveredNodeMolecule);
  const { IdToSoulAtom, SoulToNodeAtom, SoulIdToNodeAtom } = getMol(
    SouldsInDocMolecule
  );
  const { GetSoulAtom } = getMol(SoulsMolecule);
  const { SelectedNodeAtom, SelectedSoulAtom } = getMol(SelectedMolecule);

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
          const slot = target?.attributes['raisin-plop-slot'] ?? "";
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
    const hovered = get(HoveredNodeAtom);
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
    HoveredRectAtom: defaultRectAtom(
      IframeAtom,
      HoveredNodeAtom,
      GetSoulAtom,
      HoveredRectAtom
    ),
    SelectedRectAtom: defaultRectAtom(
      IframeAtom,
      SelectedNodeAtom,
      GetSoulAtom,
      SelectedRectAtom
    ),
    CanvasEventAtom,
    IframeAtom,
  };
});
