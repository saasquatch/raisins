import { Atom, atom, PrimitiveAtom } from 'jotai';
import { atomWithSetStateListener } from './atomWithSetterListener';
import { createMemoizeAtom } from './weakCache';

const idMap = new WeakMap<object, string>();
const memoizeAtom = createMemoizeAtom();

export function getId<T extends object>(obj: T) {
  if (!idMap.has(obj)) {
    idMap.set(obj, 'id-' + Math.random());
  }
  return idMap.get(obj);
}

const listener = (
  get: unknown,
  set: unknown,
  prevValue: object,
  nextValue: object
): void => {
  if (idMap.has(prevValue)) {
    const prevId = idMap.get(prevValue)!;
    // console.log('Transfering id', prevId, 'from', prevValue, 'to', nextValue);
    idMap.set(nextValue, prevId);
  } else {
    // console.log('No id to transfer for', prevValue);
  }
};

export function atomWithId<T extends object>(
  baseAtom: PrimitiveAtom<T>
): PrimitiveAtom<T> {
  return memoizeAtom(() => atomWithSetStateListener(baseAtom, listener), [
    baseAtom,
  ]);
}
