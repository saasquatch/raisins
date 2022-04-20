import { Atom, atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { VNodeStyle } from 'snabbdom';
import { SelectedNodeMolecule } from '../../core/selection/SelectedNode';
import { SoulsMolecule } from '../../core/souls/Soul';
import { CanvasConfigMolecule } from '../CanvasConfig';
import { CanvasScopedMolecule, RichCanvasEvent } from '../CanvasScopeMolecule';
import { defaultRectAtom } from '../util/defaultRectAtom';
import { SnabdomRenderer } from '../util/raisinToSnabdom';

export const CanvasSelectionMolecule = molecule((getMol, getScope) => {
  const canvasAtoms = getMol(CanvasScopedMolecule);
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
  CanvasConfig.RendererSet.add(Renderer);

  return {
    SelectedRectAtom: defaultRectAtom(
      canvasAtoms.GeometryAtom,
      SelectedNodeAtom,
      GetSoulAtom,
      CanvasConfig.SoulAttributeAtom
    ),
  };
});
