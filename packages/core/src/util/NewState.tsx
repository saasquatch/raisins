
export type NewState<T> = T | ((previousState?: T) => T);
export type StateUpdater<T> = (value: NewState<T>) => void;
