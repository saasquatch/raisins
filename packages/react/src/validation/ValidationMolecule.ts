import { validateNode } from '@raisins/core';
import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { ComponentModelMolecule } from '../component-metamodel';
import { CoreMolecule } from '../core';

export const ValidationMolecule = molecule((getMol) => {
  const { RootNodeAtom } = getMol(CoreMolecule);
  const MetaMolecule = getMol(ComponentModelMolecule);

  const errorsAtom = atom((get) => {
    const root = get(RootNodeAtom);
    const meta = get(MetaMolecule.ComponentsAtom);
    const errorStack = validateNode(root, meta);
    return errorStack;
  });

  return {
    errorsAtom,
  };
});
