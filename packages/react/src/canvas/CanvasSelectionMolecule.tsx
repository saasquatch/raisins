import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { SelectedNodeMolecule } from '../core/selection/SelectedNode';
import { SoulsMolecule } from '../core/souls/Soul';
import { SoulsInDocMolecule } from '../core/souls/SoulsInDocumentAtoms';
import { CanvasEvent } from './api/_CanvasRPCContract';
import { CanvasConfigMolecule } from './CanvasConfig';
import { CanvasScopedMolecule } from './CanvasScopedMolecule';
import { defaultRectAtom } from './defaultRectAtom';

export const CanvasSelectionMolecule = molecule((getMol, getScope) => {
  const canvasAtoms = getMol(CanvasScopedMolecule);
  const CanvasConfig = getMol(CanvasConfigMolecule);
  const { IdToSoulAtom } = getMol(SoulsInDocMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);
  const { SelectedNodeAtom, SelectedSoulAtom } = getMol(SelectedNodeMolecule);

  /**
   * Listens for click events, marks clicked elements as selected
   */
  const SelectedClickedAtom = atom(null, (get, set, e: CanvasEvent) => {
    const { target, type } = e;
    const idToSoul = get(IdToSoulAtom);
    const raisinsAttribute = get(CanvasConfig.SoulAttributeAtom);
    if (type === 'click') {
      const soulId = target?.attributes[raisinsAttribute];
      if (soulId) {
        const soul = soulId ? idToSoul(soulId) : undefined;
        set(SelectedSoulAtom, soul);
      }
    }
  });
  canvasAtoms.addListenerAtom(SelectedClickedAtom);

  return {
    SelectedRectAtom: defaultRectAtom(
      canvasAtoms.GeometryAtom,
      SelectedNodeAtom,
      GetSoulAtom,
      CanvasConfig
    ),
  };
});
