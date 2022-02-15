import { RaisinNode } from '@raisins/core';
import { atom } from 'jotai';

export type Soul = { id: string };
export const SoulsAtom = atom<WeakMap<RaisinNode, Soul>>(() => new WeakMap());
/**
 * Get (or create) a soul
 */

export const GetSoulAtom = atom<(node: RaisinNode) => Soul>((get) => {
  const souls = get(SoulsAtom);

  return (n: RaisinNode) => {
    let soul = souls.get(n);
    if (soul) return soul;
    soul = createSoul();
    souls.set(n, soul);
    return soul;
  };
});

export function createSoul(): Soul {
  return {
    created: Date.now(),
    id: 'soul-' + Math.round(Math.random() * 10000),
    toString() {
      return this.id;
    },
  } as Soul;
}
export function soulToString(soul: Soul): string {
  return soul.toString();
}
