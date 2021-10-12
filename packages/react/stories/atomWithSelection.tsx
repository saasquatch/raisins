import { NodePath, RaisinNode } from '@raisins/core';
import { atom, Getter, PrimitiveAtom } from 'jotai';
import { atomWithNodePath } from './atomWithNodePath';
import { isFunction } from './isFunction';
import { createMemoizeAtom } from './weakCache';
import { selection } from './_atoms';

const memoize = createMemoizeAtom();

/**
 * Toggle-style atom from RaisinNode primitive
 *
 * @param baseAtom
 */
export function atomWithSelection(baseAtom: PrimitiveAtom<RaisinNode>) {
  const getSelected = (get: Getter) => {
    const selected = get(selection);
    const path = get(atomWithNodePath(baseAtom));
    return matches(path, selected);
  };
  return memoize(
    () =>
      atom<boolean, boolean | undefined>(getSelected, (get, set, next) => {
        // const shouldSelect = next ?? !getSelected(get);
        // if (shouldSelect) {
          set(selection, get(atomWithNodePath(baseAtom)));
        // } else {
        //   // Reset selection
        //   set(selection, []);
        // }
      }),
    [baseAtom]
  );
}

function matches(one?: NodePath, two?: NodePath): boolean {
  if (one?.length !== two?.length) return false;
  return (
    one?.reduce<boolean>((match, segment, idx) => {
      const newLocal = two?.[idx];
      const segmentMatches = segment === newLocal;
      return segmentMatches && match;
    }, true) ?? false
  );
}
