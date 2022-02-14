import { Atom, atom, WritableAtom } from 'jotai';
import { MutableRefObject } from 'react';

export default function connectedAtom<T>(
  initializer: (get: WriteGetter, set: Setter) => T,
  destroy?: (value:T|null)=>void
): Atom<T | null> {
  const ValueAtom = atom<T | null>(null);
  const ProxyAtom = atom(
    (get) => get(ValueAtom)!,
    (get, set, ref: MutableRefObject<T | null>) => {
      const value = initializer(get, set);
      ref.current = value;
      set(ValueAtom, value);
    }
  );
  ProxyAtom.onMount = (setAtom) => {
    const ref:MutableRefObject<T | null> = {
        current: null
    }
    setAtom(ref);
    destroy && destroy(ref.current);
  };

  const ReadOnlyAtom = atom((get) => get(ProxyAtom));
  return ReadOnlyAtom;
}

declare type Getter = {
  <Value>(atom: Atom<Value | Promise<Value>>): Value;
  <Value>(atom: Atom<Promise<Value>>): Value;
  <Value>(atom: Atom<Value>): Value;
};
type WriteGetter = Getter & {
  <Value>(atom: Atom<Value | Promise<Value>>, unstable_promise: true):
    | Value
    | Promise<Value>;
  <Value>(atom: Atom<Promise<Value>>, unstable_promise: true):
    | Value
    | Promise<Value>;
  <Value>(atom: Atom<Value>, unstable_promise: true): Value | Promise<Value>;
};
type Setter = {
  <Value>(atom: WritableAtom<Value, undefined>): void | Promise<void>;
  <Value, Update>(
    atom: WritableAtom<Value, Update>,
    update: Update
  ): void | Promise<void>;
};
