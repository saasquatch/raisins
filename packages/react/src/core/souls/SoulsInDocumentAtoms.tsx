import { htmlUtil, RaisinNode } from '@raisins/core';
import { atom } from 'jotai';
import { molecule } from 'bunshi/react';
import { CoreMolecule } from '../CoreAtoms';
import { Soul, SoulsMolecule, soulToString } from './Soul';

const { visitAll } = htmlUtil;

export const SoulsInDocMolecule = molecule((getMol) => {
  const { RootNodeAtom } = getMol(CoreMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);

  /**
   * Soul ID --> Soul Object
   *
   * Map of all the soul IDs in the document
   * to their matching soul.
   *
   * Note: This could rely on looking in the graveyard (history stack)
   * to find souls as well, since all we're looking for is
   * destringifying.
   *
   * Note: This changes whenever the document changes, so it could be inefficient.
   */
  const IdToSoulAtom = atom((get) => {
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

  /**
   * Soul Object --> RaisinNode
   *
   * Map of all the souls in the document
   * to their matchin node
   *
   * Note: This changes whenever the document changes, so it could be inefficient.
   */
  const SoulToNodeAtom = atom((get) => {
    const root = get(RootNodeAtom);
    const getSoul = get(GetSoulAtom);

    const soulToNode = new WeakMap<Soul, RaisinNode>();
    visitAll(root, (n: RaisinNode) => {
      const soulForNode = getSoul(n);
      soulToNode.set(soulForNode, n);
      return n;
    });
    return (soul: Soul) => soulToNode.get(soul);
  });
  SoulToNodeAtom.debugLabel = 'SoulToNodeAtom';

  /**
   * Soul ID --> RaisinNode
   *
   * Map of all the soul IDs in the document
   * to their matching raisin node.
   *
   * Note: This changes whenever the document changes, so it could be inefficient.
   */
  const SoulIdToNodeAtom = atom((get) => {
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

  return {
    SoulToNodeAtom,
    SoulIdToNodeAtom,
    IdToSoulAtom,
  };
});
