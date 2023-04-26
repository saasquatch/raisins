import {
  calculatePlopTargets,
  isElementNode,
  isRoot,
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { CustomElement } from '@raisins/schema/schema';
import { Atom, atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { h, VNode, VNodeStyle } from 'snabbdom';
import { ComponentModelMolecule } from '../../component-metamodel';
import {
  CoreMolecule,
  PickAndPlopMolecule,
  SoulsInDocMolecule,
  SoulsMolecule,
} from '../../core';
import { RawCanvasEvent } from '../api/_CanvasRPCContract';
import { CanvasConfigMolecule } from '../CanvasConfig';
import { CanvasScopeMolecule, RichCanvasEvent } from '../CanvasScopeMolecule';
import { defaultRectAtom } from '../util/defaultRectAtom';
import { SnabbdomAppender, SnabbdomRenderer } from '../util/raisinToSnabdom';

export const CanvasPickAndPlopMolecule = molecule(getMol => {
  const CanvasConfig = getMol(CanvasConfigMolecule);
  const CanvasAtoms = getMol(CanvasScopeMolecule);
  const { ParentsAtom } = getMol(CoreMolecule);
  const {
    PlopNodeInSlotAtom,
    PickedAtom,
    PickedNodeAtom,
    PloppingIsActive,
  } = getMol(PickAndPlopMolecule);
  const { IdToSoulAtom, SoulToNodeAtom } = getMol(SoulsInDocMolecule);
  const { ComponentModelAtom, IsInteractibleAtom } = getMol(
    ComponentModelMolecule
  );
  const { GetSoulAtom } = getMol(SoulsMolecule);

  /**
   * Listens for double click events, marks double clicked elements as selected
   * Only triggers with NODE_ENV=development
   */
  if (process.env.NODE_ENV === 'development') {
    const DoubleClickAtom = atom(null, (_, set, e: RichCanvasEvent) => {
      if (e.type === 'dblclick') {
        set(PickedNodeAtom, e.node);
      }
    });
    DoubleClickAtom.debugLabel = 'SelectedClickedAtom';
    CanvasAtoms.addEventListener('dblclick', DoubleClickAtom);
  }

  const PickAndPlopStyleAtom = atom(
    `<style>

    raisins-plop-target{
      z-index: 999;
    }

    raisins-plop-target:hover{
      z-index: 9999;
    }

    .plop-target-container *{
      background: #439b76;
      transition: 0.1s all ease-in-out;
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
          const parentNode = soulToNode(parentSoul) as
            | RaisinElementNode
            | RaisinDocumentNode;
          if (!parentNode) return;
          const idx = Number(target?.attributes['raisin-plop-idx']);
          const slot = target?.attributes['raisin-plop-slot'] ?? '';
          set(PlopNodeInSlotAtom, { parent: parentNode, idx, slot });
          // If plop, don't do select logic
          return;
        }
      }
    }
  );
  CanvasAtoms.addEventListener('click', PickAndPlopListenerAtom);

  const AppenderAtom = atom(get => {
    const souls = get(GetSoulAtom);
    const isPloppingActive = get(PloppingIsActive);
    const picked = get(PickedAtom);
    const pickedForMove = get(PickedNodeAtom);
    const parents = get(ParentsAtom);
    const metamodel = get(ComponentModelAtom);
    const eventsAttribute = get(CanvasConfig.EventAttributeAtom);
    const isInteractible = get(IsInteractibleAtom);

    const addOrMove =
      picked?.type === 'block' ? 'add' : ('move' as 'add' | 'move');
    const pickedNode =
      picked?.type === 'block' ? picked.block.content : pickedForMove;
    const appender: SnabbdomAppender = (vnodeChildren, n) => {
      if (!pickedNode || !isElementNode(pickedNode)) return vnodeChildren;
      if (!isPloppingActive) return vnodeChildren;
      if (!isInteractible(n)) return vnodeChildren;

      // FIXME: Root node should allow any children. This only checks for allowed element plops.
      // if (!isElementNode(n)) return vnodeChildren;

      const slot =
        (n as RaisinElementNode).attribs?.slot ??
        pickedNode.attribs?.slot ??
        '';
      const isValid = metamodel.isValidChild(pickedNode, n, slot);
      if (!isValid) return vnodeChildren;
      const parent = n as RaisinElementNode & RaisinNodeWithChildren;
      const soulId = souls(parent).toString();
      const parentMeta = metamodel.getComponentMeta(parent.tagName);
      const possiblePlopMeta = metamodel.getComponentMeta(pickedNode.tagName);
      const plopTargets = calculatePlopTargets(
        parent,
        pickedNode,
        {
          parentMeta,
          possiblePlopMeta,
        },
        parents
      );

      const plopsForZeroIndex = plopTargets
        .filter(plop => plop.idx === 0)
        .map(plop => {
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
            plop => plop.idx === idx + 1
          );

          const plopViews = plopsForNextIndex.map(plop => {
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

          return [...acc, vnodeChild, ...plopViews];
        }, plopsForZeroIndex as Array<string | VNode>) ?? [];

      return newChildren;
    };
    return appender;
  });
  CanvasAtoms.AppendersSet.add(AppenderAtom);

  const Renderer: Atom<SnabbdomRenderer> = atom(get => {
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
  parent: RaisinElementNode | RaisinDocumentNode;
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
  const slotTitle =
    parentSchema?.slots?.find(foundSlot => slot === foundSlot.name)?.title ||
    parentSchema.title ||
    'Content';

  // Prevent plop target from being cut off at the top/bottom of the canvas
  const paddedPlopStyle =
    isRoot(parent) && (idx <= 1 || idx === parent.children.length - 1)
      ? {
          height: '14px',
          marginTop: '26px',
        }
      : {};

  const key = `${soulId}/${idx}/${slot}`;

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
    `${addOrMove === 'add' ? 'Add' : 'Move'} to ${slotTitle}`
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
    'raisins-plop-target',
    {
      // Helps snabbdom know how to remove nodes
      key,
      attrs: { slot },
      style: {
        height: '0px',
        margin: '0',
        overflow: 'visible',
        position: 'relative',
        display: 'block',
        marginTop: '0',
        ...paddedPlopStyle,
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
