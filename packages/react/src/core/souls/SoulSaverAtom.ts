import { RaisinNode } from '@raisins/core';
import { atom } from 'jotai';
import { GetSoulAtom, SoulsAtom } from './Soul';

/**
 * A `onReplace` function atom that will
 * save the previous node's soul as the replacement
 * node's soul 
 */
export const SoulSaverAtom = atom((get) => {
  const getSoul = get(GetSoulAtom);
  const souls = get(SoulsAtom);
  return (prev: RaisinNode, next: RaisinNode) => {
    const prevSoul = getSoul(prev);
    souls.set(next, prevSoul);
    // const nextSoul = souls.get(next);
    return next;
  };
});
