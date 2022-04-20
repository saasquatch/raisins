import { Atom, atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { VNodeStyle } from 'snabbdom';
import { SelectedNodeMolecule } from '../core/selection/SelectedNode';
import { SoulsMolecule } from '../core/souls/Soul';
import { SoulsInDocMolecule } from '../core/souls/SoulsInDocumentAtoms';
import { CanvasEvent } from './api/_CanvasRPCContract';
import { CanvasConfigMolecule } from './CanvasConfig';
import { CanvasScopedMolecule } from './CanvasScopedMolecule';
import { defaultRectAtom } from './defaultRectAtom';
import { SnabdomRenderer } from './raisinToSnabdom';

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

  const Renderer: Atom<SnabdomRenderer> = atom((get) => {
    const selected = get(SelectedNodeAtom);
    const renderer: SnabdomRenderer = (d, n) => {
      const isSelected = selected === n;
      const isOutlined = isSelected;
      const { delayed, remove, ...rest } = d.style || {};
      const style: VNodeStyle = {
        ...rest,
        cursor: 'pointer',
        outline: isSelected ? '2px solid rgba(255,0,0,0.5)' : '',
        outlineOffset: isOutlined ? '-2px' : '',
      };

      return {
        ...d,
        style,
      };
    };
    return renderer;
  });

  // Registers this renderer
  CanvasConfig.RendererSet.add(Renderer);

  return {
    SelectedRectAtom: defaultRectAtom(
      canvasAtoms.GeometryAtom,
      SelectedNodeAtom,
      GetSoulAtom,
      CanvasConfig
    ),
  };
});
