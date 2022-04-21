import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { VNodeStyle } from 'snabbdom';
import { HoveredNodeMolecule } from '../../core/selection/HoveredNode';
import { SoulsMolecule } from '../../core/souls/Soul';
import { CanvasConfigMolecule } from '../CanvasConfig';
import { CanvasScopeMolecule, RichCanvasEvent } from '../CanvasScopeMolecule';
import { defaultRectAtom } from '../util/defaultRectAtom';
import { SnabbdomRenderer } from '../util/raisinToSnabdom';

export const CanvasHoveredMolecule = molecule((getMol, getScope) => {
  const CanvasConfig = getMol(CanvasConfigMolecule);
  const CanvasAtoms = getMol(CanvasScopeMolecule);
  const { HoveredNodeAtom, HoveredSoulAtom } = getMol(HoveredNodeMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);

  const CanvasHoveredListenerAtom = atom(null, (_, set, e: RichCanvasEvent) => {
    if (e.type === 'mouseover') {
      set(HoveredSoulAtom, e.soul);
    }
  });
  CanvasHoveredListenerAtom.debugLabel = 'CanvasHoveredListenerAtom';
  CanvasAtoms.ListenersSet.add(CanvasHoveredListenerAtom);

  const RendererAtom = atom((get) => {
    const hovered = get(HoveredNodeAtom);

    const renderer: SnabbdomRenderer = (d, n) => {
      const isHovered = hovered === n;

      const { delayed, remove, ...rest } = d.style || {};
      const style: VNodeStyle = {
        ...rest,
        cursor: 'pointer',
        outline: isHovered ? '2px solid green' : rest.outline ?? '',
        outlineOffset: isHovered ? '-2px' : rest.outlineOffset,
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
