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
import { SnabbdomAppender, SnabbdomRenderer } from '../util/raisinToSnabdom';

export const CanvasPickAndPlopMolecule = molecule((getMol) => {
  const CanvasConfig = getMol(CanvasConfigMolecule);
  const CanvasAtoms = getMol(CanvasScopedMolecule);
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
  CanvasAtoms.addListenerAtom(DoubleClickAtom);

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
  CanvasAtoms.addListenerAtom(PickAndPlopListenerAtom);

  const AppenderAtom = atom((get) => {
    const node = get(RootNodeAtom);
    const souls = get(GetSoulAtom);
    const isPloppingActive = get(PloppingIsActive);
    const pickedNode = get(PickedNodeAtom);
    const metamodel = get(ComponentModelAtom);
    const eventsAttribute = get(CanvasConfig.EventAttributeAtom);

    const appenderId = Math.random();
    const appender: SnabbdomAppender = (vnodeChildren, n) => {
      if (!pickedNode || !isElementNode(pickedNode)) return vnodeChildren;
      if (!isPloppingActive || !isElementNode(n)) return vnodeChildren;
      const parent = n;

      // TODO: Root node should allow any children
      if (!isElementNode(parent)) return vnodeChildren;

      const slot = n.attribs.slot ?? '';
      const isValid = metamodel.isValidChild(pickedNode, parent, slot);
      if (!isValid) return vnodeChildren;
      const soulId = souls(parent).toString();

      const raisinChildren = parent.children;
      const newChildren =
        vnodeChildren?.reduce((acc, vnodeChild, idx) => {
          const raisinChild = raisinChildren[idx];
          if (
            // No plop around text nodes
            !isElementNode(raisinChild) ||
            // No plops around picked node (that's redundant)
            raisinChild === pickedNode
          ) {
            // No plop targets around element nodes
            return [...acc, vnodeChild];
          }

          const plopBefore = PlopTargetView({
            idx,
            slot,
            soulId,
            eventsAttribute,
            parent,
          });
          return [...acc, plopBefore, vnodeChild];
        }, [] as Array<string | VNode>) ?? [];

      console.log(
        soulId,
        appenderId,
        'appended',
        vnodeChildren,
        'to',
        newChildren,
        'for kids',
        raisinChildren
      );
      return newChildren;
    };
    return appender;
  });
  CanvasAtoms.AppendersSet.add(AppenderAtom);

  const Renderer: Atom<SnabbdomRenderer> = atom((get) => {
    const picked = get(PickedNodeAtom);
    const renderer: SnabbdomRenderer = (d, n) => {
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
  CanvasAtoms.RendererSet.add(Renderer);

  return {
    PickedRectAtom: defaultRectAtom(
      CanvasAtoms.GeometryAtom,
      PickedNodeAtom,
      GetSoulAtom,
      CanvasConfig.SoulAttributeAtom
    ),
  };
});

type SnabdomComponent<T> = (props: T) => VNode;

type PlopTargetViewProps = {
  idx: number;
  soulId: string;
  slot: string;
  eventsAttribute: string;
  parent: RaisinElementNode;
};
const PlopTargetView: SnabdomComponent<PlopTargetViewProps> = ({
  soulId,
  slot,
  idx,
  eventsAttribute,
  parent,
}) => {
  return h(
    'div',
    {
      style: {
        // height: '0px',
        overflow: 'visible',
      },
    },
    h(
      'div',
      {
        style: {
          background: 'yellow',
          // height: '8px',
          // top: '-4px',
          zIndex: '999',
          position: 'relative',
        },
        attrs: {
          slot,
          'raisin-plop-target': true,
          'raisin-plop-parent': soulId,
          'raisin-plop-slot': slot,
          'raisin-plop-idx': idx,
          [eventsAttribute]: true,
        },
      },
      `${parent?.tagName} index ${idx}`
    )
  );
};
