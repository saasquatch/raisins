import {
  htmlUtil,
  isElementNode,
  isNodeAllowed,
  RaisinElementNode,
  RaisinNode,
  calculatePlopTargets,
} from '@raisins/core';
import { CustomElement } from '@raisins/schema/schema';
import { Atom, atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { h, vnode, VNode, VNodeStyle } from 'snabbdom';
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
  const { RootNodeAtom } = getMol(CoreMolecule);
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
  CanvasAtoms.ListenersSet.add(DoubleClickAtom);

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
    const node = get(RootNodeAtom);
    const souls = get(GetSoulAtom);
    const isPloppingActive = get(PloppingIsActive);
    const picked = get(PickedAtom);
    const pickedForMove = get(PickedNodeAtom);
    const metamodel = get(ComponentModelAtom);
    const eventsAttribute = get(CanvasConfig.EventAttributeAtom);

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
  parentSchema: CustomElement;
};
const PlopTargetView: SnabdomComponent<PlopTargetViewProps> = ({
  soulId,
  slot,
  idx,
  eventsAttribute,
  parent,
  parentSchema,
}) => {
  const defaultAttrs = {
    slot,
    'raisin-plop-target': true,
    'raisin-plop-parent': soulId,
    'raisin-plop-slot': slot,
    'raisin-plop-idx': idx,
    [eventsAttribute]: true,
  };

  // const addIcon = h(
  //   'svg',
  //   {
  //     attrs: {
  //       xmlns: 'http://www.w3.org/2000/svg',
  //       viewBox: '0 0 20 20',
  //       height: '14px',
  //       width: '14px',
  //       fill: '#fff',
  //     },
  //     style: { display: 'block' },
  //   },
  //   h('path', {
  //     attrs: { d: 'M17 11.5H11.5V17H8.5V11.5H3V8.5H8.5V3H11.5V8.5H17V11.5Z' },
  //   })
  // );

  // const addLabel = h(
  //   'div',
  //   {
  //     style: {
  //       backgroundColor: '#439b76',
  //       color: '#fff',
  //       margin: 'auto',
  //       position: 'relative',
  //       borderRadius: '100px',
  //       width: '24px',
  //       textAlign: 'center',
  //       height: '24px',
  //       display: 'flex',
  //       justifyContent: 'center',
  //       alignItems: 'center',
  //     },
  //   },
  //   addIcon
  // );

  const activeType = 'Add';

  const PlopLabel = h(
    'div',
    {
      style: {
        backgroundColor: '#439b76',
        color: '#fff',
        fontSize: '12px',
        lineHeight: '16px',
        margin: 'auto',
        zIndex: '999',
        position: 'relative',
        borderRadius: '100px',
        padding: '4px 8px',
        textTransform: 'none',
      },
    },
    `${activeType} to ${parentSchema.title}`
  );

  const targetBar = h('div', {
    style: {
      backgroundColor: '#439b76',
      height: '3px',
      width: '100%',
      margin: 'auto',
      zIndex: '999',
      position: 'relative',
    },
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
    // h(
    //   'div',
    //   {
    //     style: {
    //       background: 'yellow',
    //       // height: '8px',
    //       // top: '-4px',
    //       zIndex: '999',
    //       position: 'relative',
    //     },
    //     attrs: {
    //       slot,
    //       'raisin-plop-target': true,
    //       'raisin-plop-parent': soulId,
    //       'raisin-plop-slot': slot,
    //       'raisin-plop-idx': idx,
    //       [eventsAttribute]: true,
    //     },
    //   },
    //   `${parent?.tagName} index ${idx}`
    // )
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
        attrs: defaultAttrs,
      },
      [targetBar, PlopLabel, targetBar]
    )
  );
};
