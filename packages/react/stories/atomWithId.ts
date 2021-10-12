import { atom, PrimitiveAtom, SetStateAction } from 'jotai';
import { isFunction } from './isFunction';

const idMap = new WeakMap<object, string>();

export function getId<T extends object>(obj: T) {
  const id = idMap.get(obj);
  if (!id) {
    idMap.set(obj, 'id-' + Math.random());
    return idMap.get(obj);
  }
}
export function atomWithId<T extends object>(baseAtom: PrimitiveAtom<T>) {
  const middlewareAtom = atom<T, SetStateAction<T>>(
    (get) => {
      const value = get(baseAtom);
      const id = idMap.get(value);
      if (!id) {
        idMap.set(value, 'id-' + Math.random());
        return value;
      }
    },
    (get, set, next) => {
      const prevValue = get(baseAtom);
      const nextValue = isFunction(next) ? next(prevValue) : prevValue;
      const oldId = idMap.get(prevValue);
      // When a node is replaced, it gets the previous ID
      idMap.set(nextValue, oldId);
      set(baseAtom, nextValue);
    }
  );

  return middlewareAtom;
}
