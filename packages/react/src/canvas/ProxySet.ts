import { atomWithStore } from 'jotai/zustand';
import create from 'zustand/vanilla';

type SetStore<T> = { values: T[]; add(item: T): void };

export function createProxy<T extends object>() {
  const store = create<SetStore<T>>((set) => ({
    values: [],
    add: (item: T) => {
      set((state) => ({ values: [...state.values, item] }));
    },
    remove: (item: T) =>
      set((state) => ({ values: state.values.filter((v) => v !== item) })),
  }));

  return {
    set: store.getState(),
    atom: atomWithStore(store),
  };
}
