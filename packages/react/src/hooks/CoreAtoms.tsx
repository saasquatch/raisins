import {
  getPath,
  htmlParser,
  htmlSerializer,
  htmlUtil,
  NodePath,
  NodeSelection,
  RaisinNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { atom, Getter, PrimitiveAtom, SetStateAction } from 'jotai';
import { HTMLAtom } from '../atoms/RaisinScope';
import { GetSoulAtom, Soul, SoulsAtom, soulToString } from "../atoms/Soul";
import { generateNextState } from '../editting/EditAtoms';
import { IdentifierModel } from '../model/EditorModel';
import { isFunction } from '../util/isFunction';

export type InternalState = {
  current: RaisinNode;
  undoStack: RaisinNode[];
  redoStack: RaisinNode[];
  selected?: NodeSelection;
};

const { getParents, getAncestry: getAncestryUtil, visit, visitAll } = htmlUtil;

const nodeToId = new WeakMap<RaisinNode, string>();

export const IdToSoulAtom = atom((get) => {
  const root = get(RootNodeAtom);
  const getSoul = get(GetSoulAtom);
  const soulIdToNode = new Map<string, Soul>();
  visitAll(root, (n: RaisinNode) => {
    const soulForNode = getSoul(n);

    soulIdToNode.set(soulToString(soulForNode), soulForNode);
    return n;
  });
  return (id: string) => soulIdToNode.get(id);
});
IdToSoulAtom.debugLabel = 'IdToSoulAtom';

export const SoulToNodeAtom = atom((get) => {
  const root = get(RootNodeAtom);
  const getSoul = get(GetSoulAtom);

  const soulToNode = new Map<Soul, RaisinNode>();
  visitAll(root, (n: RaisinNode) => {
    const soulForNode = getSoul(n);
    soulToNode.set(soulForNode, n);
    return n;
  });
  return (soul: Soul) => soulToNode.get(soul);
});
SoulToNodeAtom.debugLabel = 'SoulToNodeAtom';

export const SoulIdToNodeAtom = atom((get) => {
  const root = get(RootNodeAtom);
  const getSoul = get(GetSoulAtom);
  const soulIdToNode = new Map<string, RaisinNode>();
  visitAll(root, (n: RaisinNode) => {
    const soulForNode = getSoul(n);
    soulIdToNode.set(soulToString(soulForNode), n);
    return n;
  });
  return (id: string) => soulIdToNode.get(id);
});
SoulIdToNodeAtom.debugLabel = 'SoulIdToNodeAtom';

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

const NodeFromHtml = atom((get) => htmlParser(get(HTMLAtom)));
const getDerivedInternal = (get: Getter) => {
  const current = get(NodeFromHtml);
  const historyState = get(HistoryAtom);
  return {
    current,
    ...historyState,
  };
};

// Should be made private
export const InternalStateAtom: PrimitiveAtom<InternalState> = atom(
  getDerivedInternal,
  (get, set, next: SetStateAction<InternalState>) => {
    const iState = getDerivedInternal(get);
    const { current, ...rest } = isFunction(next) ? next(iState) : next;

    if (current !== iState.current) {
      const htmlString = htmlSerializer(current);
      set(HTMLAtom, htmlString);
    }
    set(HistoryAtom, rest);
  }
);
InternalStateAtom.debugLabel = 'InternalStateAtom';

export const HistoryAtom = atom<Omit<InternalState, 'current'>>({
  redoStack: [],
  undoStack: [],
  selected: undefined,
});
HistoryAtom.debugLabel = 'HistoryAtom';

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
RootNodeAtom.debugLabel = 'RootNodeAtom';

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
IdentifierModelAtom.debugLabel = 'IdentifierModelAtom';

/**
 * Derived map of parents
 */
export const ParentsAtom = atom((get) => {
  const doc = get(InternalStateAtom).current;
  return getParents(doc);
});
ParentsAtom.debugLabel = 'ParentsAtom';
