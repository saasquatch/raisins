import { useAtomValue } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import React from 'react';
import { NodeMolecule } from '../NodeMolecule';
import { SlotScopeProvider } from './SlotScope';

export type SlotChildrenControllerProps = {
  /**
   * Component that should be rendered for every slot
   */
  Component: React.ComponentType;
};

/**
 * Controller that renders a Component in a {@link SlotScopeProvider}
 * for every slot in an element.
 *
 * Scoped to the {@link NodeMolecule}
 *
 */
export function SlotChildrenController({
  Component,
}: SlotChildrenControllerProps) {
  const { allSlotsForNode } = useMolecule(NodeMolecule);
  const slots = useAtomValue(allSlotsForNode);
  const hasSlots = slots?.length > 0;

  if (!hasSlots) return <></>;
  return (
    <>
      {slots.map((s: string) => (
        <SlotScopeProvider slot={s} key={s}>
          <Component />
        </SlotScopeProvider>
      ))}
    </>
  );
}
