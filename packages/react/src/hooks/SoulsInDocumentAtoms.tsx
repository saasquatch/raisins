import { htmlUtil, RaisinNode } from '@raisins/core';
import { atom } from 'jotai';
import { GetSoulAtom, Soul, soulToString } from '../atoms/Soul';
import { RootNodeAtom } from './CoreAtoms';

const { visitAll } = htmlUtil;

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
