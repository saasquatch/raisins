import { RaisinNode } from '@raisins/core';
import { atom, PrimitiveAtom } from 'jotai';
import { isElementNode } from '../views/isNode';
import { createMemoizeAtom } from './weakCache';

const memoizeAtom = createMemoizeAtom();

export type Attributes = Record<string, any>;

/**
 * Focused atom for editing attributes
 */
export function atomForAttributes(baseAtom: PrimitiveAtom<RaisinNode>) {
  return memoizeAtom(
    () =>
      atom<Attributes, Attributes>(
        (get) => {
          const el = get(baseAtom);
          return isElementNode(el) ? el.attribs : undefined;
        },
        (_, set, next) => {
          set(baseAtom, (prev) => {
            if (!isElementNode(prev))
              throw new Error("Can't set attributes on non-element");
            return { ...prev, attribs: next };
          });
        }
      ),
    [baseAtom]
  );
}
