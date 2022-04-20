import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { VNodeStyle } from 'snabbdom';
import { HoveredNodeMolecule } from '../core/selection/HoveredNode';
import { SoulsMolecule } from '../core/souls/Soul';
import { SoulsInDocMolecule } from '../core/souls/SoulsInDocumentAtoms';
import { CanvasEvent } from './api/_CanvasRPCContract';
import { CanvasConfigMolecule } from './CanvasConfig';
import { CanvasScopedMolecule } from './CanvasScopedMolecule';
import { defaultRectAtom } from './defaultRectAtom';
import { SnabdomRenderer } from './raisinToSnabdom';

export const CanvasHoveredMolecule = molecule((getMol, getScope) => {
  const CanvasConfig = getMol(CanvasConfigMolecule);
  const CanvasAtoms = getMol(CanvasScopedMolecule);
  const { SoulAttributeAtom } = CanvasConfig;
  const { HoveredNodeAtom, HoveredSoulAtom } = getMol(HoveredNodeMolecule);
  const { IdToSoulAtom } = getMol(SoulsInDocMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);

  const CanvasEventAtom = atom(null, (get, set, e: CanvasEvent) => {
    const { target, type } = e;
    const idToSoul = get(IdToSoulAtom);
    const raisinsAttribute = get(SoulAttributeAtom);
    if (type === 'mouseover') {
      const soulId = target?.attributes[raisinsAttribute];
      const soul = soulId ? idToSoul(soulId) : undefined;
      set(HoveredSoulAtom, soul);
    }
  });
  CanvasAtoms.addListenerAtom(CanvasEventAtom);

  const RendererAtom = atom((get) => {
    const hovered = get(HoveredNodeAtom);

    const renderer: SnabdomRenderer = (d, n) => {
      const isHovered = hovered === n;
      const { delayed, remove, ...rest } = d.style || {};
      const style: VNodeStyle = {
        ...rest,
        cursor: 'pointer',
        outline: isHovered ? '2px solid green' : '',
        outlineOffset: isHovered ? '-2px' : '',
      };

      return {
        ...d,
        style,
      };
    };
    return renderer;
  });

  CanvasConfig.RendererSet.add(RendererAtom);

  return {
    HoveredRectAtom: defaultRectAtom(
      CanvasAtoms.GeometryAtom,
      HoveredNodeAtom,
      GetSoulAtom,
      CanvasConfig.SoulAttributeAtom
    ),
  };
});
