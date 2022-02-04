import { isElementNode, RaisinNode } from '@raisins/core';
import { atom } from 'jotai';
import { idToNode, ParentsAtom } from '../hooks/CoreAtoms';

export const HoveredAtom = atom<RaisinNode | undefined>(undefined);

export const SetHoveredIdAtom = atom(null, (_, set, id: string | undefined) =>
  set(HoveredAtom, id && idToNode.get(id) || undefined)
);

export const HoveredRectAtom = atom<{x:number, y:number} | undefined>(undefined)
export const HoveredPath = atom((get) => {
  const node = get(HoveredAtom);
  if (!node) return '';
  const parents = get(ParentsAtom);

  const tagNames = [];
  let current = node;
  while (parents.has(current)) {
    const parent = parents.get(current)!;
    if (isElementNode(parent)) {
      tagNames.push(parent.tagName);
    }
    current = parent;
  }
  return tagNames.reverse().join(' > ');
});
