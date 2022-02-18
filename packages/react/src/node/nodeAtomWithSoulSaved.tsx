import { RaisinNode } from '@raisins/core';
import { atom, PrimitiveAtom } from 'jotai';
import { SoulsAtom } from '../core/souls/Soul';
import { createMemoizeAtom } from '../util/weakCache';
import { isFunction } from '../util/isFunction';

/**
 * Creates a proxy atom of `nodeAtom` that preserves the
 * soul of the node when it is updated.
 * 
 * Memoized internally based on `nodeAtom` to prevent creating
 * atoms all the time.
 * 
 * @param nodeAtom - the atom to wrap/proxy
 * @returns a proxy atom with soul saved
 */
export function nodeAtomWithSoulSaved(
  nodeAtom: PrimitiveAtom<RaisinNode>
): PrimitiveAtom<RaisinNode> {
  return memoized(() => {
    return atom(
      (get) => get(nodeAtom),
      (get, set, next) => {
        set(nodeAtom, (prev) => {
          const souls = get(SoulsAtom);
          const soul = souls.get(prev);
          const nextNode = isFunction(next) ? next(prev) : next;
          soul && souls.set(nextNode, soul);
          return nextNode;
        });
      }
    );
  }, [nodeAtom]);
}
const memoized = createMemoizeAtom();
