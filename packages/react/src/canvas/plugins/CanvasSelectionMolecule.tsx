import { Atom, atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { VNodeStyle } from 'snabbdom';
import { SelectedNodeMolecule } from '../../core/selection/SelectedNodeMolecule';
import { SoulsMolecule } from '../../core/souls/Soul';
import { CanvasConfigMolecule } from '../CanvasConfig';
import { CanvasScopeMolecule, RichCanvasEvent } from '../CanvasScopeMolecule';
import { defaultRectAtom } from '../util/defaultRectAtom';
import { SnabbdomRenderer } from '../util/raisinToSnabdom';

export const CanvasSelectionMolecule = molecule((getMol, getScope) => {
  const CanvasAtoms = getMol(CanvasScopeMolecule);
  const CanvasConfig = getMol(CanvasConfigMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);
  const { SelectedNodeAtom, SelectedSoulAtom } = getMol(SelectedNodeMolecule);

  /**
   * Listens for click events, marks clicked elements as selected
   */
  const SelectedClickedAtom = atom(null, (_, set, e: RichCanvasEvent) => {
    if (e.type === 'click') {
      set(SelectedSoulAtom, e.soul);
    }
  });
  SelectedClickedAtom.debugLabel = 'SelectedClickedAtom';
  CanvasAtoms.ListenersSet.add(SelectedClickedAtom);

  const Renderer: Atom<SnabbdomRenderer> = atom((get) => {
    const selected = get(SelectedNodeAtom);
    const renderer: SnabbdomRenderer = (d, n) => {
      const isSelected = selected === n;
      const isOutlined = isSelected;
      const { delayed, remove, ...rest } = d.style || {};
      const style: VNodeStyle = {
        ...rest,
        cursor: 'pointer',
        outline: isSelected
          ? '2px solid rgba(255,0,0,0.5)'
          : rest.outline ?? '',
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
