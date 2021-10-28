import { RaisinNode } from '@raisins/core';
import { atom, PrimitiveAtom, SetStateAction } from 'jotai';
import { isFunction } from '../util/isFunction';
import { isElementNode } from '../util/isNode';
import { createMemoizeAtom } from './weakCache';

const memoizeAtom = createMemoizeAtom();

export type Attributes = Record<string, any>;

/**
 * Focused atom for editing attributes
 */
export function atomForAttributes(baseAtom: PrimitiveAtom<RaisinNode>) {
  return memoizeAtom(
    () =>
      atom<Attributes, SetStateAction<Attributes>>(
        (get) => {
          const el = get(baseAtom);
          return isElementNode(el) ? el.attribs : undefined ?? {};
        },
        (_, set, next:SetStateAction<Attributes>) => {
          set(baseAtom, (prev) => {
            if (!isElementNode(prev))
              throw new Error("Can't set attributes on non-element");
            const nextValue = isFunction(next) ? next(prev.attribs) : next;
            return { ...prev, attribs: nextValue };
          });
        }
      ),
    [baseAtom]
  );
}
