import { atom } from 'jotai';
import { molecule } from 'bunshi/react';
import { type VNodeStyle } from 'snabbdom';
import { PickAndPlopMolecule } from '../../core/index.ts';
import { HoveredNodeMolecule } from '../../core/selection/HoveredNodeMolecule.tsx';
import { SoulsMolecule } from '../../core/souls/Soul.ts';
import { CanvasConfigMolecule } from '../CanvasConfig.tsx';
import { CanvasScopeMolecule, type RichCanvasEvent } from '../CanvasScopeMolecule.tsx';
import { throttleAtom } from '../iframe/throttledAtom.tsx';
import { defaultRectAtom } from '../util/defaultRectAtom.tsx';
import { type SnabbdomRenderer } from '../util/raisinToSnabdom.tsx';

export const CanvasHoveredMolecule = molecule((getMol, getScope) => {
  const CanvasConfig = getMol(CanvasConfigMolecule);
  const CanvasAtoms = getMol(CanvasScopeMolecule);
  const { PickedNodeAtom, PloppingIsActive } = getMol(PickAndPlopMolecule);

  const { HoveredNodeAtom, HoveredSoulAtom } = getMol(HoveredNodeMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);

  const ThrottledHoveredSoulAtom = throttleAtom(50, HoveredSoulAtom);
  const CanvasHoveredListenerAtom = atom(
    null,
    (get, set, e: RichCanvasEvent) => {
      if (e.type === 'mouseover') {
        const isPlopping = get(PloppingIsActive);
        // Disable during plop
        if (isPlopping) return;
        set(ThrottledHoveredSoulAtom, e.soul);
      }
    }
  );
  CanvasHoveredListenerAtom.debugLabel = 'CanvasHoveredListenerAtom';

  const RendererAtom = atom(get => {
    const hovered = get(HoveredNodeAtom);
    const picked = get(PickedNodeAtom);
    const renderer: SnabbdomRenderer = (d, n) => {
      const isHovered = hovered === n && !picked;

      const { delayed, remove, ...rest } = d.style || {};
      const style = {
        ...rest,
        cursor: 'pointer',
        outline: isHovered ? '2px solid #59A7E8' : rest.outline ?? '',
        // Disabled outline due to flickering, may just render outside canvas instead
        // outlineOffset: isHovered ? '-2px' : rest.outlineOffset,
        outlineOffset: '0',
      } as VNodeStyle;

      return {
        ...d,
        style,
      };
    };
    return renderer;
  });
  CanvasAtoms.registerOnce(CanvasHoveredMolecule, () => {
    CanvasAtoms.addEventListener('mouseover', CanvasHoveredListenerAtom);
    CanvasAtoms.RendererSet.add(RendererAtom);
  });

  return {
    HoveredRectAtom: defaultRectAtom(
      CanvasAtoms.GeometryAtom,
      HoveredNodeAtom,
      GetSoulAtom,
      CanvasConfig.SoulAttributeAtom
    ),
  };
});
