import { RaisinElementNode } from '@raisins/core';
import { atom } from 'jotai';
import {
  ComponentMetaAtom,
  ComponentModelAtom,
} from '../component-metamodel/ComponentModel';
import { DuplicateNodeAtom, RemoveNodeAtom } from '../editting/EditAtoms';
import { SelectedAtom, SelectedNodeAtom } from '../selection/SelectedAtom';
import { isElementNode } from '../util/isNode';
import { atomForNode } from './node-context';

export const isSelectedForNode = atomForNode((n) =>
  atom((get) => get(SelectedNodeAtom) === get(n))
);
export const setSelectedForNode = atomForNode((n) =>
  atom(null, (get, set) => {
    set(SelectedAtom, get(n));
  })
);
export const isNodeAnElement = atomForNode((n) =>
  atom((get) => isElementNode(get(n)))
);
const componentMetaForNode = atomForNode((n) =>
  atom((get) => {
    const comp = get(ComponentModelAtom);
    const node = get(n);
    return comp.getComponentMeta(node as RaisinElementNode);
  })
);
export const slotsForNode = atomForNode((n) =>
  atom((get) => {
    const comp = get(ComponentModelAtom);
    const node = get(n);
    return comp.getSlots(node as RaisinElementNode);
  })
);
export const removeForNode = atomForNode((n) =>
  atom(null, (get, set) => set(RemoveNodeAtom, get(n)))
);
export const duplicateForNode = atomForNode((n) =>
  atom(null, (get, set) => set(DuplicateNodeAtom, get(n)))
);
export const nameForNode = atomForNode((n) =>
  atom((get) => {
    const node = get(n);
    const getComponentMeta = get(ComponentMetaAtom);
    if (!isElementNode(node)) return node.type;
    const meta = getComponentMeta(node);
    return meta?.title ?? node.tagName;
  })
);
