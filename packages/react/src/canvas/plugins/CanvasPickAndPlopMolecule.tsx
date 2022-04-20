import { isElementNode, RaisinElementNode } from '@raisins/core';
import { Atom, atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { h, VNode, VNodeStyle } from 'snabbdom';
import { ComponentModelMolecule } from '../../component-metamodel';
import {
  CoreMolecule,
  PickedNodeMolecule,
  SoulsInDocMolecule,
  SoulsMolecule,
} from '../../core';
import { RawCanvasEvent } from '../api/_CanvasRPCContract';
import { CanvasConfigMolecule } from '../CanvasConfig';
import { CanvasScopedMolecule, RichCanvasEvent } from '../CanvasScopeMolecule';
import { defaultRectAtom } from '../util/defaultRectAtom';
import { SnabdomAppender, SnabdomRenderer } from '../util/raisinToSnabdom';

export const CanvasPickAndPlopMolecule = molecule((getMol) => {
  const CanvasConfig = getMol(CanvasConfigMolecule);
  const canvasAtoms = getMol(CanvasScopedMolecule);
  const { DropPloppedNodeInSlotAtom } = getMol(PickedNodeMolecule);
  const { IdToSoulAtom, SoulToNodeAtom } = getMol(SoulsInDocMolecule);
  const { ComponentModelAtom } = getMol(ComponentModelMolecule);
  const { RootNodeAtom } = getMol(CoreMolecule);
  const { PickedNodeAtom, PloppingIsActive } = getMol(PickedNodeMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);
  /**
   * Listens for click events, marks clicked elements as selected
   */
  const DoubleClickAtom = atom(null, (_, set, e: RichCanvasEvent) => {
    if (e.type === 'dblclick') {
      set(PickedNodeAtom, e.node);
    }
  });
  DoubleClickAtom.debugLabel = 'SelectedClickedAtom';
  canvasAtoms.addListenerAtom(DoubleClickAtom);

  const PickAndPlopListenerAtom = atom(
    null,
    (get, set, { type, target }: RawCanvasEvent) => {
      const idToSoul = get(IdToSoulAtom);
      if (type === 'click') {
        const plopParentSoulId = target?.attributes['raisin-plop-parent'];
        if (plopParentSoulId) {
          const parentSoul = plopParentSoulId
            ? idToSoul(plopParentSoulId)
            : undefined;
          if (!parentSoul) return;
          const soulToNode = get(SoulToNodeAtom);
          const parentNode = soulToNode(parentSoul);
          if (!parentNode || !isElementNode(parentNode)) return;
          const idx = Number(target?.attributes['raisin-plop-idx']);
          const slot = target?.attributes['raisin-plop-slot'] ?? '';
          set(DropPloppedNodeInSlotAtom, { parent: parentNode, idx, slot });
          // If plop, don't do select logic
          return;
        }
      }
    }
  );
  canvasAtoms.addListenerAtom(PickAndPlopListenerAtom);

  const AppenderAtom = atom((get) => {
    const node = get(RootNodeAtom);
    const souls = get(GetSoulAtom);
    const isPloppingActive = get(PloppingIsActive);
    const pickedNode = get(PickedNodeAtom);
    const metamodel = get(ComponentModelAtom);

    const appender: SnabdomAppender = (c, n) => {
      if (!pickedNode || !isElementNode(pickedNode)) return c;
      if (!isPloppingActive || !isElementNode(n)) return c;
      const parent = n;

      // TODO: Root node should allow any children
      if (!isElementNode(parent)) return c;

      const slot = n.attribs.slot ?? '';
      const isValid = metamodel.isValidChild(pickedNode, parent, slot);
      if (!isValid) return c;
      const soulId = souls(parent).toString();

      const newChildren =
        c?.reduce((acc, child, idx) => {
          const plopTarget = createPlopTargetNode({
            idx,
            slot,
            soulId,
            parent,
          });
          return [...acc, plopTarget, child];
        }, [] as Array<string | VNode>) ?? [];
      return newChildren;
    };
    return appender;
  });
  // CanvasConfig.AppendersSet.add(AppenderAtom);

  const Renderer: Atom<SnabdomRenderer> = atom((get) => {
    const picked = get(PickedNodeAtom);
    const renderer: SnabdomRenderer = (d, n) => {
      const isPicked = picked === n;
      const { delayed, remove, ...rest } = d.style || {};
      const style: VNodeStyle = {
        ...rest,
        cursor: 'pointer',
        outline: isPicked ? '2px solid rgba(0,0,255,0.5)' : rest.outline ?? '',
        outlineOffset: isPicked ? '-2px' : '',
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
    PickedRectAtom: defaultRectAtom(
      canvasAtoms.GeometryAtom,
      PickedNodeAtom,
      GetSoulAtom,
      CanvasConfig.SoulAttributeAtom
    ),
  };
});

function createPlopTargetNode({
  soulId,
  slot,
  idx,
  parent,
}: {
  idx: number;
  soulId: string;
  slot: string;
  parent: RaisinElementNode;
}) {
  return h(
    'div',
    {
      style: {
        height: '0px',
        overflow: 'visible',
      },
    },
    h(
      'div',
      {
        style: {
          background: 'yellow',
          height: '8px',
          top: '-4px',
          zIndex: '999',
          position: 'relative',
        },
        attrs: {
          slot,
          'raisin-plop-target': true,
          'raisin-plop-parent': soulId,
          'raisin-plop-slot': slot,
          'raisin-plop-idx': idx,
          'raisins-events': true,
        },
      },
      ` `
    )
  );
}
