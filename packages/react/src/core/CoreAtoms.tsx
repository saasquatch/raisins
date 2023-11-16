import {
  generateJsonPointers,
  getPath,
  htmlParser,
  htmlSerializer,
  htmlUtil,
  NodePath,
  RaisinNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { atom, SetStateAction, WritableAtom } from 'jotai';
import { molecule } from 'bunshi/react';
import { MutableRefObject } from 'react';
import { ConfigMolecule } from './RaisinConfigScope';

export type InternalState = {
  current: RaisinNode;
};

const { getParents, getAncestry: getAncestryUtil } = htmlUtil;

export type InternalStateTransaction =
  | {
      // Mostly just used for undo/redo. Will skip state listeners.
      type: 'raw-set';
      next: RaisinNode;
    }
  | {
      type: 'set';
      next: RaisinNode;
    };

type NodeAndHTML = MutableRefObject<
  { html: string; node: RaisinNode } | undefined
>;

export const CoreMolecule = molecule((getMol, getScope) => {
  const { HTMLAtom } = getMol(ConfigMolecule);

  const HtmlCacheAtom = atom(new WeakMap<RaisinNode, string>());
  const NodeWithHtmlRefAtom = atom<NodeAndHTML>({ current: undefined });

  /*
    Scenario: Souls are presered when downstream HTML matches upstream HTML

        Given html has been loaded
        And a node is generated
        When a node is changed
        Then it's set upstream as serialized html
        When new serialized html is received downstream
        And the downstream html matches the upstream html
        Then a new node is not generated
        And a cached node is used
        And souls are preserved
  */
  const NodeFromHtml = atom(
    (get) => {
      const ref = get(NodeWithHtmlRefAtom);
      const html = get(HTMLAtom);
      if (ref.current?.html === html) {
        return ref.current.node;
      }
      return htmlParser(html, { cleanWhitespace: false });
    },
    (get, set, current: RaisinNode) => {
      const cache = get(HtmlCacheAtom);
      let htmlString = cache.get(current);
      if (!htmlString) {
        htmlString = htmlSerializer(current);
        cache.set(current, htmlString);
      }
      const ref = get(NodeWithHtmlRefAtom);
      ref.current = { html: htmlString, node: current };
      set(HTMLAtom, htmlString);
    }
  );

  const StateListeners = new Set<
    WritableAtom<unknown, { prev: RaisinNode; next: RaisinNode }>
  >([]);

  const InternalTransactionAtom = atom(
    null,
    (get, set, next: InternalStateTransaction) => {
      const prev = get(NodeFromHtml);
      set(NodeFromHtml, next.next);
      if (next.type === 'set') {
        StateListeners.forEach((l) => set(l, { prev: prev, next: next.next }));
      }
    }
  );

  const RootNodeAtom = atom(
    (get) => get(NodeFromHtml),
    (get, set, next: SetStateAction<RaisinNode>) => {
      const nextNode =
        typeof next === 'function' ? next(get(NodeFromHtml)) : next;
      set(InternalTransactionAtom, { type: 'set', next: nextNode });
    }
  );
  RootNodeAtom.debugLabel = 'RootNodeAtom';

  const IdentifierModelAtom = atom<IdentifierModel>((get) => {
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
      getPath: getPathInternal,
    };
  });
  IdentifierModelAtom.debugLabel = 'IdentifierModelAtom';

  /**
   * RaisinNode --> RaisinNode (Parent)
   *
   * Map of children to their parents in the current document
   *
   */
  const ParentsAtom = atom((get) => {
    const doc = get(RootNodeAtom);
    return getParents(doc);
  });
  ParentsAtom.debugLabel = 'ParentsAtom';

  const JsonPointersAtom = atom((get) =>
    generateJsonPointers(get(RootNodeAtom))
  );
  JsonPointersAtom.debugLabel = 'JsonPointersAtom';

  /**
   * Used to override default behavior of @canvasRenderer "always-replace"
   */
  const rerenderNodeAtom = atom(false);

  return {
    NodeFromHtml,
    NodeWithHtmlRefAtom,
    RootNodeAtom,
    IdentifierModelAtom,
    ParentsAtom,
    JsonPointersAtom,
    StateListeners,
    InternalTransactionAtom,
    rerenderNodeAtom,
  };
});

export type IdentifierModel = {
  getAncestry(node: RaisinNode): RaisinNodeWithChildren[];
  getPath(node: RaisinNode): NodePath;
};
