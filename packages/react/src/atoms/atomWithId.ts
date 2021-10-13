import { Atom, atom, PrimitiveAtom } from 'jotai';
import { isFunction } from '../util/isFunction';
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
  get: {
    <Value>(atom: Atom<Value | Promise<Value>>): Value;
    <Value>(atom: Atom<Promise<Value>>): Value;
    <Value>(atom: Atom<Value>): Value;
  },
  prevValue: object,
  nextValue: object
): void => {
  if (idMap.has(prevValue)) {
    const prevId = idMap.get(prevValue)!;
    idMap.set(nextValue, prevId);
  }
};

export function primitiveWithId<T extends object>(
  baseAtom: PrimitiveAtom<T>
): PrimitiveAtom<T> {
  return memoizeAtom(() => atomWithSetStateListener(baseAtom, listener), [
    baseAtom,
  ]);
}

export function atomWithId<T extends object>(
  baseAtom: PrimitiveAtom<T>
): Atom<string> {
  return memoizeAtom(
    () =>
      atom<string>((get) => {
        const obj = get(baseAtom);
        if (!idMap.has(obj)) {
          idMap.set(obj, 'id-' + Math.random());
        }
        return idMap.get(obj)!;
      }),
    [baseAtom]
  );
}
