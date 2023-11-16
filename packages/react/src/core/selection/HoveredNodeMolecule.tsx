import { isElementNode, RaisinNode } from '@raisins/core';
import { atom } from 'jotai';
import { molecule } from 'bunshi/react';
import { ComponentModelMolecule } from '../../component-metamodel/ComponentModel';
import { CoreMolecule } from '../CoreAtoms';
import { Soul } from '../souls/Soul';
import { SoulsInDocMolecule } from '../souls/SoulsInDocumentAtoms';

export const HoveredNodeMolecule = molecule((getMol) => {
  const { ParentsAtom } = getMol(CoreMolecule);
  const { SoulToNodeAtom } = getMol(SoulsInDocMolecule);
  const { ComponentMetaAtom } = getMol(ComponentModelMolecule);

  const HoveredSoulAtom = atom<Soul | undefined>(undefined);
  HoveredSoulAtom.debugLabel = 'HoveredSoulAtom';

  const HoveredNodeAtom = atom<RaisinNode | undefined>((get) => {
    const hoveredSoul = get(HoveredSoulAtom);
    if (!hoveredSoul) return undefined;
    const getNode = get(SoulToNodeAtom);
    return getNode(hoveredSoul);
  });
  HoveredNodeAtom.debugLabel = 'HoveredNodeAtom';

  const HoveredBreadcrumbsAtom = atom((get) => {
    const node = get(HoveredNodeAtom);
    if (!node) return '';
    const parents = get(ParentsAtom);
    const metamodel = get(ComponentMetaAtom);
    const tagNames = isElementNode(node)
      ? [metamodel(node.tagName).title ?? node.tagName]
      : [];
    let current = node;
    while (parents.has(current)) {
      const parent = parents.get(current)!;
      if (isElementNode(parent)) {
        tagNames.push(metamodel(parent.tagName).title ?? parent.tagName);
      }
      current = parent;
    }
    return tagNames.reverse().join(' > ');
  });
  HoveredBreadcrumbsAtom.debugLabel = 'HoveredBreadcrumbsAtom';

  return {
    HoveredSoulAtom,
    HoveredNodeAtom,
    HoveredBreadcrumbsAtom,
  };
});
