import {
  htmlUtil,
  NodePath,
  RaisinNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { atom } from 'jotai';
import { molecule } from 'bunshi/react';
import { CoreMolecule } from '../CoreAtoms';
import { SoulsMolecule } from '../souls/Soul';
import {
  generateId,
  RAISIN_ID_ATTR,
} from '../../css-editing/RaisinCssIds';
import { RaisinIdsMolecule } from '../../css-editing/RaisinIdsMolecule';

const { duplicate, insertAt, remove, replace, replacePath, visit } = htmlUtil;

function cloneWithFreshRaisinIds(node: RaisinNode, usedIds: Set<string>) {
  const nextId = () => {
    let id = generateId();
    while (usedIds.has(id)) id = generateId();
    usedIds.add(id);
    return id;
  };

  return visit<RaisinNode>(node, {
    onText: text => text,
    onDirective: directive => directive,
    onComment: comment => comment,
    onStyle: style => style,
    onElement: (element, children) => ({
      ...element,
      attribs: element.attribs[RAISIN_ID_ATTR]
        ? { ...element.attribs, [RAISIN_ID_ATTR]: nextId() }
        : element.attribs,
      children,
    }),
    onRoot: (root, children) => ({ ...root, children }),
  })!;
}

export const EditMolecule = molecule((getMol) => {
  const { RootNodeAtom } = getMol(CoreMolecule);
  const { SoulSaverAtom } = getMol(SoulsMolecule);
  const { UsedRaisinIdsAtom } = getMol(RaisinIdsMolecule);

  /**
   * Deletes a raisin node from the document
   */
  const RemoveNodeAtom = atom(null, (get, set, toRemove: RaisinNode) =>
    set(RootNodeAtom, (previous: RaisinNode) =>
      remove(previous, toRemove, get(SoulSaverAtom))
    )
  );

  /**
   * Deletes a raisins node, adding a duplicate as a sibling in the document
   */
  const DuplicateNodeAtom = atom(null, (get, set, toClone: RaisinNode) => {
    const usedIds = new Set(get(UsedRaisinIdsAtom));
    set(RootNodeAtom, previous =>
      duplicate(previous, toClone, get(SoulSaverAtom), node =>
        cloneWithFreshRaisinIds(node, usedIds)
      )
    );
  });

  /**
   * Inserts a node at a given position
   */
  const InsertNodeAtom = atom(
    null,
    (
      get,
      set,
      {
        node: n,
        parent,
        idx,
      }: {
        node: RaisinNode;
        parent: RaisinNodeWithChildren;
        idx: number;
      }
    ) => {
      set(RootNodeAtom, (prev) =>
        insertAt(prev, n, parent, idx, get(SoulSaverAtom))
      );
    }
  );

  /**
   * Replaces a node with a new node
   */
  const ReplaceNodeAtom = atom(
    null,
    (get, set, { prev, next }: { prev: RaisinNode; next: RaisinNode }) => {
      const soulSaver = get(SoulSaverAtom);
      set(RootNodeAtom, (previous) =>
        replace(
          previous,
          prev,
          next,
          (old: RaisinNode, replacement: RaisinNode) =>
            soulSaver(old, replacement)
        )
      );
    }
  );

  const ReplacePathAtom = atom(
    null,
    (get, set, { prev, next }: { prev: NodePath; next: RaisinNode }) => {
      set(RootNodeAtom, (previous) =>
        replacePath(previous, prev, next, get(SoulSaverAtom))
      );
    }
  );
  return {
    RootNodeAtom,
    RemoveNodeAtom,
    DuplicateNodeAtom,
    InsertNodeAtom,
    ReplaceNodeAtom,
    ReplacePathAtom,
  };
});
