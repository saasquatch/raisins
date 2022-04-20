import { isElementNode } from '@raisins/core';
import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { h, VNode } from 'snabbdom';
import { ComponentModelMolecule } from '../component-metamodel';
import {
  CoreMolecule,
  PickedNodeMolecule,
  SoulsInDocMolecule,
  SoulsMolecule,
} from '../core';
import { CanvasEvent } from './api/_CanvasRPCContract';
import { CanvasConfigMolecule } from './CanvasConfig';
import { CanvasScopedMolecule } from './CanvasScopedMolecule';
import { SnabdomAppender } from './raisinToSnabdom';

export const CanvasPickAndPlopMolecule = molecule((getMol) => {
  const canvasAtoms = getMol(CanvasScopedMolecule);
  const { DropPloppedNodeInSlotAtom } = getMol(PickedNodeMolecule);
  const { IdToSoulAtom, SoulToNodeAtom } = getMol(SoulsInDocMolecule);
  const CanvasOptions = getMol(CanvasConfigMolecule);
  const { ComponentModelAtom } = getMol(ComponentModelMolecule);
  const { RootNodeAtom } = getMol(CoreMolecule);
  const { PickedNodeAtom, PloppingIsActive } = getMol(PickedNodeMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);

  const PickAndPlopListenerAtom = atom(
    null,
    (get, set, { type, target }: CanvasEvent) => {
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
      // 0 - infer plop targets from slot names and metamodel
      // 1 - only render appropriate plop targets
      // 2 - render pretty plop targets (See Head atom)
      // 3 - add appropriate attrs to make `onClick` work (and rewrite select-on-click stuff)
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
          const plopTarget = createPlopTargetNode({ idx, slot, soulId });
          return [...acc, plopTarget, child];
        }, [] as Array<string | VNode>) ?? [];
      return newChildren;
    };
    return appender;
  });
  CanvasOptions.AppendersSet.add(AppenderAtom);
});

function createPlopTargetNode({
  soulId,
  slot,
  idx,
}: {
  idx: number;
  soulId: string;
  slot: string;
}) {
  return h(
    'div',
    {
      attrs: {
        slot,
        'raisin-plop-target': true,
        'raisin-plop-parent': soulId,
        'raisin-plop-slot': slot,
        'raisin-plop-idx': idx,
        'raisins-events': true,
      },
    },
    'Plop here'
  );
}
