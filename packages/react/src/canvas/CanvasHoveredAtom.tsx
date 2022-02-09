import { isElementNode, RaisinNode } from '@raisins/core';
import { atom } from 'jotai';
import { ComponentMetaAtom } from '../component-metamodel/ComponentModel';
import { idToNode, ParentsAtom } from '../hooks/CoreAtoms';
import { Rect } from './Rect';

export const HoveredAtom = atom<RaisinNode | undefined>(undefined);

export const SetHoveredIdAtom = atom(null, (_, set, id: string | undefined) =>
  set(HoveredAtom, (id && idToNode.get(id)) || undefined)
);

/**
 * TODO: these should not be global, they need to be per-canvas (e.g. one canvas might have an element open, the other closed, different sizes)
 */
export const HoveredRectAtom = atom<Rect | undefined>(undefined);
/**
 * TODO: these should not be global, they need to be per-canvas (e.g. one canvas might have an element open, the other closed, different sizes)
 */
export const SelectedRectAtom = atom<Rect | undefined>(undefined);

export const HoveredPath = atom((get) => {
  const node = get(HoveredAtom);
  if (!node) return '';
  const parents = get(ParentsAtom);
  const metamodel = get(ComponentMetaAtom);
  const tagNames = isElementNode(node)
    ? [metamodel(node).title ?? node.tagName]
    : [];
  let current = node;
  while (parents.has(current)) {
    const parent = parents.get(current)!;
    if (isElementNode(parent)) {
      tagNames.push(metamodel(parent).title ?? parent.tagName);
    }
    current = parent;
  }
  return tagNames.reverse().join(' > ');
});
