import { htmlUtil, RaisinNode } from '@raisins/core';
import { atom } from 'jotai';
const { visit } = htmlUtil;

export type Soul = { id: string };

/**
 * Generate the tree of souls, for debugging
 */
export function generateSoulTree(
  node: RaisinNode,
  map: WeakMap<RaisinNode, Soul>
) {
  const getSoul = (n: RaisinNode) => ({
    soul: map.get(n)?.toString() ?? 'No soul',
  });
  const getSoulAndChildren = (n: RaisinNode, children: string[]) => ({
    ...getSoul(n),
    children,
  });
  return visit<any>(node, {
    onComment: getSoul,
    onDirective: getSoul,
    onText: getSoul,
    onStyle: getSoul,
    onElement: getSoulAndChildren,
    onRoot: getSoulAndChildren,
  });
}

export const SoulsAtom = atom<WeakMap<RaisinNode, Soul>>(() => {
  return new WeakMap();
});

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

let soulNumber = 1;
export function createSoul(): Soul {
  return {
    created: Date.now(),
    id: 'soul-' + ++soulNumber,
    toString() {
      return this.id;
    },
  } as Soul;
}
export function soulToString(soul: Soul): string {
  return soul.toString();
}
