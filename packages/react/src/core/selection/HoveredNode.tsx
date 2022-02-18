import { isElementNode, RaisinNode } from '@raisins/core';
import { atom } from 'jotai';
import { Soul } from '../souls/Soul';
import { ComponentMetaAtom } from '../../component-metamodel/ComponentModel';
import { ParentsAtom } from '../CoreAtoms';
import { SoulToNodeAtom } from '../souls/SoulsInDocumentAtoms';

export const HoveredSoulAtom = atom<Soul | undefined>(undefined);
HoveredSoulAtom.debugLabel = 'HoveredSoulAtom';

export const HoveredNodeAtom = atom<RaisinNode | undefined>((get) => {
  const hoveredSoul = get(HoveredSoulAtom);
  if (!hoveredSoul) return undefined;
  const getNode = get(SoulToNodeAtom);
  return getNode(hoveredSoul);
});
HoveredNodeAtom.debugLabel = 'HoveredNodeAtom';

export const HoveredBreadcrumbsAtom = atom((get) => {
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
