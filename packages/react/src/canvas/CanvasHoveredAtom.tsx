import { getPath, isElementNode, RaisinNode } from '@raisins/core';
import { atom } from 'jotai';
import { Soul } from "../atoms/Soul";
import { ComponentMetaAtom } from '../component-metamodel/ComponentModel';
import { ParentsAtom, RootNodeAtom } from '../hooks/CoreAtoms';
import { SoulToNodeAtom } from "../hooks/SoulsInDocumentAtoms";

export const HoveredSoulAtom = atom<Soul | undefined>(undefined);
HoveredSoulAtom.debugLabel = 'HoveredSoulAtom';

export const HoveredAtom = atom<RaisinNode | undefined>((get) => {
  const hoveredSoul = get(HoveredSoulAtom);
  if (!hoveredSoul) return undefined;
  const getNode = get(SoulToNodeAtom);
  return getNode(hoveredSoul);
});
HoveredAtom.debugLabel = 'HoveredAtom';

export const HoveredBreadcrumbs = atom((get) => {
  const node = get(HoveredAtom);
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
