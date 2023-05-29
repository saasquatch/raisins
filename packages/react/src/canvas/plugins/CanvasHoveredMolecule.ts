import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { VNodeStyle } from 'snabbdom';
import { PickAndPlopMolecule } from '../../core';
import { HoveredNodeMolecule } from '../../core/selection/HoveredNodeMolecule';
import { SoulsMolecule } from '../../core/souls/Soul';
import { CanvasConfigMolecule } from '../CanvasConfig';
import { CanvasScopeMolecule, RichCanvasEvent } from '../CanvasScopeMolecule';
import { throttleAtom } from '../iframe/throttledAtom';
import { defaultRectAtom } from '../util/defaultRectAtom';
import { SnabbdomRenderer } from '../util/raisinToSnabdom';

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
  CanvasAtoms.addEventListener('mouseover', CanvasHoveredListenerAtom);

  const RendererAtom = atom((get) => {
    const hovered = get(HoveredNodeAtom);
    const picked = get(PickedNodeAtom);
    const renderer: SnabbdomRenderer = (d, n) => {
      const isHovered = hovered === n && !picked;

      const { delayed, remove, ...rest } = d.style || {};
      const style: VNodeStyle = {
        ...rest,
        cursor: 'pointer',
        outline: isHovered ? '2px solid #A4E0FB' : rest.outline ?? '',
        // Disabled outline due to flickering, may just render outside canvas instead
        // outlineOffset: isHovered ? '-2px' : rest.outlineOffset,
        outlineOffset: '0',
      };

      return {
        ...d,
        style,
      };
    };
    return renderer;
  });
  CanvasAtoms.RendererSet.add(RendererAtom);

  return {
    HoveredRectAtom: defaultRectAtom(
      CanvasAtoms.GeometryAtom,
      HoveredNodeAtom,
      GetSoulAtom,
      CanvasConfig.SoulAttributeAtom
    ),
  };
});
