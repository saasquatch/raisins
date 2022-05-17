import { Atom, atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { VNodeStyle } from 'snabbdom';
import { PickAndPlopMolecule } from '../../core';
import { SelectedNodeMolecule } from '../../core/selection/SelectedNodeMolecule';
import { SoulsMolecule } from '../../core/souls/Soul';
import { CanvasConfigMolecule } from '../CanvasConfig';
import { CanvasScopeMolecule, RichCanvasEvent } from '../CanvasScopeMolecule';
import { defaultRectAtom } from '../util/defaultRectAtom';
import { SnabbdomRenderer } from '../util/raisinToSnabdom';

export const CanvasSelectionMolecule = molecule((getMol) => {
  const CanvasAtoms = getMol(CanvasScopeMolecule);
  const CanvasConfig = getMol(CanvasConfigMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);
  const { SelectedNodeAtom, SelectedSoulAtom } = getMol(SelectedNodeMolecule);
  const { PickedAtom } = getMol(PickAndPlopMolecule);
  /**
   * Listens for click events, marks clicked elements as selected
   */
  const SelectedClickedAtom = atom(null, (get, set, e: RichCanvasEvent) => {
    if (e.type === 'click' && !get(PickedAtom)) {
      set(SelectedSoulAtom, e.soul);
    }
  });
  SelectedClickedAtom.debugLabel = 'SelectedClickedAtom';
  CanvasAtoms.addEventListener('click', SelectedClickedAtom);

  const Renderer: Atom<SnabbdomRenderer> = atom((get) => {
    const selected = get(SelectedNodeAtom);
    const picked = get(PickedAtom);
    const renderer: SnabbdomRenderer = (d, n) => {
      const isSelected = selected === n && !picked;
      const { delayed, remove, ...rest } = d.style || {};
      const style: VNodeStyle = {
        ...rest,
        cursor: 'pointer',
        outline: isSelected ? '2px solid #439B76' : rest.outline ?? '',
        outlineOffset: '',
      };

      return {
        ...d,
        style,
      };
    };
    return renderer;
  });

  // Registers this renderer
  CanvasAtoms.RendererSet.add(Renderer);

  return {
    SelectedRectAtom: defaultRectAtom(
      CanvasAtoms.GeometryAtom,
      SelectedNodeAtom,
      GetSoulAtom,
      CanvasConfig.SoulAttributeAtom
    ),
  };
});
