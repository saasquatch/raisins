import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { HoveredNodeMolecule } from '../core/selection/HoveredNode';
import { SoulsMolecule } from '../core/souls/Soul';
import { SoulsInDocMolecule } from '../core/souls/SoulsInDocumentAtoms';
import { CanvasEvent } from './api/_CanvasRPCContract';
import { CanvasConfigMolecule } from './CanvasConfig';
import { CanvasScopedMolecule } from './CanvasScopedMolecule';
import { defaultRectAtom } from './defaultRectAtom';

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

  return {
    HoveredRectAtom: defaultRectAtom(
      CanvasAtoms.GeometryAtom,
      HoveredNodeAtom,
      GetSoulAtom,
      CanvasConfig
    ),
  };
});
