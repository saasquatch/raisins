
export type Reducer<T> = (previousState: T) => T;
export type NewState<T> = T | Reducer<T>;
export type StateUpdater<T> = (value: NewState<T>) => void;
