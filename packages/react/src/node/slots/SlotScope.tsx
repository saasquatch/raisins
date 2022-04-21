import { RaisinNodeWithChildren } from '@raisins/core';
import type { Slot } from '@raisins/schema/schema';
import { atom } from 'jotai';
import { createScope, molecule, ScopeProvider } from 'jotai-molecules';
import { focusAtom } from 'jotai/optics';
import { splitAtom } from 'jotai/utils';
import { optic_ } from 'optics-ts';
import React from 'react';
import { ComponentModelMolecule } from '../../component-metamodel/ComponentModel';
import { NodeMolecule } from '../NodeMolecule';
import { isInSlot } from './isInSlot';

export const SlotScope = createScope<string | undefined>(undefined);
SlotScope.displayName = 'SlotScope';

export const SlotScopeProvider: React.FC<{
  slot?: string;
  children: React.ReactNode;
}> = ({ slot, children }) => {
  if (typeof slot === 'undefined')
    throw new Error('Provide a slot for <SlotScopeProvider>');

  return (
    <ScopeProvider scope={SlotScope} value={slot}>
      {children}
    </ScopeProvider>
  );
};

export const SlotScopeMolecule = molecule((_, getScope) => getScope(SlotScope));

export const SlotMolecule = molecule((getMol, getScope) => {
  const slot = getScope(SlotScope);
  if (typeof slot === 'undefined')
    throw new Error(
      `SlotMolecule needs to be used inside a <SlotScopeProvider/>. ${slot}`
    );
  const nodeAtoms = getMol(NodeMolecule);
  const { ComponentModelAtom } = getMol(ComponentModelMolecule);

  const slotDetails = atom<Slot>((get) => {
    const comp = get(ComponentModelAtom);
    const tagName = get(nodeAtoms.tagNameAtom);
    // Root has just one slot
    if (!tagName) throw new Error("Can't have a slot in a non-element");
    const meta = comp.getComponentMeta(tagName);

    return meta.slots?.find((s) => s.name === slot) ?? { name: slot };
  });

  const childrenInSlot = splitAtom(
    // Need to replace this to not replace souls
    focusAtom(nodeAtoms.nodeAtom, (o) =>
      optic_<RaisinNodeWithChildren>()
        .prop('children')
        .filter((c) => isInSlot(c, slot))
    )
  );

  return {
    slot,
    slotDetails,
    slotName: slot,
    childrenInSlot,
  };
});
