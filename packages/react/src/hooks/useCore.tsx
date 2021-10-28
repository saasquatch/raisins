import {
  getPath,
  htmlParser,
  htmlUtil,
  NodePath,
  NodeSelection,
  RaisinNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { atom, SetStateAction, useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { useEffect } from 'react';
import {
  generateNextState,
} from '../editting/EditAtoms';
import { IdentifierModel } from '../model/EditorModel';

export type InternalState = {
  current: RaisinNode;
  undoStack: RaisinNode[];
  redoStack: RaisinNode[];
  selected?: NodeSelection;
};

const { getParents, getAncestry: getAncestryUtil } = htmlUtil;

const nodeToId = new WeakMap<RaisinNode, string>();
export const idToNode = new Map<string, RaisinNode>();

export function getId(node: RaisinNode): string {
  const existing = nodeToId.get(node);
  if (existing) {
    return existing;
  }
  const id = 'node-' + Math.round(Math.random() * 10000);
  nodeToId.set(node, id);
  idToNode.set(id, node);
  return id;
}

// Should be made private
export const InternalStateAtom = atom<InternalState>({
  redoStack: [],
  undoStack: [],
  current: htmlParser('<div></div>'),
});

export const RootNodeAtom = atom(
  (get) => get(InternalStateAtom).current,
  (_, set, next: SetStateAction<RaisinNode>) => {
    set(InternalStateAtom, (previous) => {
      const nextNode =
        typeof next === 'function' ? next(previous.current) : next;
      return generateNextState(previous, nextNode, false);
    });
  }
);

export const IdentifierModelAtom = atom<IdentifierModel>((get) => {
  // TODO: Maybe this can be pushed into the internal state getters?
  // That might provide a performance boost
  const current = get(RootNodeAtom);
  const parents = get(ParentsAtom);

  function getPathInternal(node: RaisinNode): NodePath {
    return getPath(current, node)!;
  }
  function getAncestry(node: RaisinNode): RaisinNodeWithChildren[] {
    return getAncestryUtil(current, node, parents);
  }
  return {
    getAncestry,
    getId,
    getPath: getPathInternal,
  };
});

/**
 * Derived map of parents
 */
export const ParentsAtom = atom((get) => {
  const doc = get(InternalStateAtom).current;
  return getParents(doc);
});

export function useCore(initial: RaisinNode) {
  const setState = useUpdateAtom(InternalStateAtom);

  useEffect(() => {
    // Resets undo/redo stacks if the inbound value changes
    // TODO: find a place for this in the atom flow of HTML->raisinNode->HTML
    setState({ redoStack: [], undoStack: [], current: initial });
  }, [initial]);
}


