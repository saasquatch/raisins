import { RaisinNode } from '@raisins/core';
import { atom, PrimitiveAtom } from 'jotai';
import { createMemoizeAtom } from './weakCache';

const memoizeAtom = createMemoizeAtom();

export function atomWithNodeProps(
  baseAtom: PrimitiveAtom<RaisinNode>
): PrimitiveAtom<Record<string, any>> {
  return memoizeAtom(() => {
    return atom({});
  }, [baseAtom]);
}
