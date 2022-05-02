import {
  calculatePlopTargets,
  isElementNode,
  RaisinElementNode,
} from '@raisins/core';
import { CustomElement } from '@raisins/schema/schema';
import { Atom, atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { h, VNode, VNodeStyle } from 'snabbdom';
import { ComponentModelMolecule } from '../../component-metamodel';
import {
  CoreMolecule,
  HoveredNodeMolecule,
  PickAndPlopMolecule,
  SoulsInDocMolecule,
  SoulsMolecule,
} from '../../core';
import { RawCanvasEvent } from '../api/_CanvasRPCContract';
import { CanvasConfigMolecule } from '../CanvasConfig';
import { CanvasScopeMolecule, RichCanvasEvent } from '../CanvasScopeMolecule';
import { defaultRectAtom } from '../util/defaultRectAtom';
import { SnabbdomAppender, SnabbdomRenderer } from '../util/raisinToSnabdom';

export const CanvasPickAndPlopMolecule = molecule((getMol) => {
  const CanvasConfig = getMol(CanvasConfigMolecule);
  const CanvasAtoms = getMol(CanvasScopeMolecule);
  const {
    PlopNodeInSlotAtom,
    PickedAtom,
    PickedNodeAtom,
    PloppingIsActive,
  } = getMol(PickAndPlopMolecule);
  const { IdToSoulAtom, SoulToNodeAtom } = getMol(SoulsInDocMolecule);
  const { ComponentModelAtom } = getMol(ComponentModelMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);

  /**
   * Listens for double click events, marks double clicked elements as selected
   */
  if (process.env.NODE_ENV === 'development') {
    const DoubleClickAtom = atom(null, (_, set, e: RichCanvasEvent) => {
      if (e.type === 'dblclick') {
        set(PickedNodeAtom, e.node);
      }
    });
    DoubleClickAtom.debugLabel = 'SelectedClickedAtom';
    CanvasAtoms.ListenersSet.add(DoubleClickAtom);
  }

  const PickAndPlopStyleAtom = atom(
    `<style>
    .plop-target-container *{
      background: #439b76;
    }

    .plop-target-container:hover *{
      background-color: #388363;
    }

    .plop-target-container [targettype="label"]{
      padding: 4px 8px;
    }
    .plop-target-container:hover [targettype="label"]{
      padding: 8px 12px;
    }
    .plop-target-container [targettype="bar"]{
      height: 3px;
    }
    .plop-target-container:hover [targettype="bar"]{
      height: 4px;
    }

    </style>`
  );
  CanvasAtoms.HTMLSet.add(PickAndPlopStyleAtom);

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
          set(PlopNodeInSlotAtom, { parent: parentNode, idx, slot });
          // If plop, don't do select logic
          return;
        }
      }
    }
  );
  CanvasAtoms.ListenersSet.add(PickAndPlopListenerAtom);

  const AppenderAtom = atom((get) => {
    const souls = get(GetSoulAtom);
    const isPloppingActive = get(PloppingIsActive);
    const picked = get(PickedAtom);
    const pickedForMove = get(PickedNodeAtom);
    const metamodel = get(ComponentModelAtom);
    const eventsAttribute = get(CanvasConfig.EventAttributeAtom);

    const addOrMove =
      picked?.type === 'block' ? 'add' : ('move' as 'add' | 'move');
    const pickedNode =
      picked?.type === 'block' ? picked.block.content : pickedForMove;
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
      const parentMeta = metamodel.getComponentMeta(parent.tagName);
      const raisinChildren = parent.children;

      const possiblePlopMeta = metamodel.getComponentMeta(pickedNode.tagName);
      const plopTargets = calculatePlopTargets(parent, pickedNode, {
        parentMeta,
        possiblePlopMeta,
      });

      const plopPosition = raisinChildren.findIndex((n) => n === pickedNode);

      const plopsForZeroIndex = plopTargets
        .filter((plop) => plop.idx === 0)
        .map((plop) => {
          return PlopTargetView({
            idx: plop.idx,
            slot: plop.slot,
            soulId,
            eventsAttribute,
            parent,
            parentSchema: parentMeta,
            addOrMove,
          });
        });

      const newChildren =
        vnodeChildren?.reduce((acc, vnodeChild, idx) => {
          const plopsForNextIndex = plopTargets.filter(
            (plop) => plop.idx === idx + 1
          );

          const plopViews = plopsForNextIndex.map((plop) => {
            return PlopTargetView({
              idx:
                plopPosition !== -1 && idx > plopPosition
                  ? plop.idx - 1
                  : plop.idx,
              slot: plop.slot,
              soulId,
              eventsAttribute,
              parent,
              parentSchema: parentMeta,
              addOrMove,
            });
          });

          return [...acc, vnodeChild, ...plopViews];
        }, plopsForZeroIndex as Array<string | VNode>) ?? [];

      return newChildren;
    };
    return appender;
  });
  CanvasAtoms.AppendersSet.add(AppenderAtom);

  const Renderer: Atom<SnabbdomRenderer> = atom((get) => {
    const picked = get(PickedNodeAtom);
    const renderer: SnabbdomRenderer = (d, n) => {
      const isPicked = picked === n;
      if (!isPicked) return d;

      const { delayed, remove, ...rest } = d.style || {};
      const style: VNodeStyle = {
        ...rest,
        cursor: 'pointer',
        outline: isPicked ? '2px dashed #458EDF' : rest.outline ?? '',
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
  parentSchema: CustomElement;
  addOrMove: 'add' | 'move';
};
const PlopTargetView: SnabdomComponent<PlopTargetViewProps> = ({
  soulId,
  slot,
  idx,
  eventsAttribute,
  parent,
  parentSchema,
  addOrMove,
}) => {
  const defaultAttrs = {
    slot,
    'raisin-plop-target': true,
    'raisin-plop-parent': soulId,
    'raisin-plop-slot': slot,
    'raisin-plop-idx': idx,
    [eventsAttribute]: true,
  };

  const PlopLabel = h(
    'div',
    {
      style: {
        color: '#fff',
        fontSize: '12px',
        lineHeight: '16px',
        margin: 'auto',
        zIndex: '999',
        position: 'relative',
        borderRadius: '100px',
        textTransform: 'none',
      },
      attrs: { targettype: 'label' },
    },
    `${addOrMove === 'add' ? 'Add' : 'Move'} to ${parentSchema.title}`
  );

  const targetBar = h('div', {
    style: {
      width: '100%',
      margin: 'auto',
      zIndex: '999',
      position: 'relative',
    },
    attrs: { targettype: 'bar' },
  });

  return h(
    'div',
    {
      style: {
        height: '0px',
        margin: '0',
        overflow: 'visible',
        zIndex: '9999',
      },
    },
    h(
      'div',
      {
        style: {
          width: '100%',
          height: 'auto',
          display: 'grid',
          gridRow: '1',
          gridTemplateColumns: '1fr max-content 1fr',
          cursor: 'pointer',
          transform: 'translateY(-50%)',
        },
        attrs: { ...defaultAttrs, class: 'plop-target-container' },
      },
      [targetBar, PlopLabel, targetBar]
    )
  );
};
