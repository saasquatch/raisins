import { isElementNode } from '@raisins/core';
import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { PickedNodeMolecule, SoulsInDocMolecule } from '../core';
import { CanvasEvent } from './api/_CanvasRPCContract';
import { CanvasScopedMolecule } from './CanvasScopedMolecule';

export const CanvasPickAndPlopMolecule = molecule((getMol) => {
  const canvasAtoms = getMol(CanvasScopedMolecule);
  const { DropPloppedNodeInSlotAtom } = getMol(PickedNodeMolecule);
  const { IdToSoulAtom, SoulToNodeAtom } = getMol(SoulsInDocMolecule);

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
});
