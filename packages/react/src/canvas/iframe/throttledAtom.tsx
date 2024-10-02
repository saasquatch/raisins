import { atom, Setter, WritableAtom } from 'jotai';
import { throttle } from 'throttle-debounce';

/**
 * Creates a writeable atom, where the set function is always throttled
 */
export function throttledWriteAtom(delay: number) {
  const throttledSetAtom = atom({ current: null as null | Setter });
  const throttledOnEvent = atom(
    null,
    (get, set, e: { atom: WritableAtom<any, any, void>; value: any }) => {
      const throttledSetRef = get(throttledSetAtom);
      let throttledSet = throttledSetRef.current;
      if (!throttledSet) {
        throttledSet = set;
        throttledSetRef.current = (throttle(
          delay,
          throttledSet
        ) as unknown) as Setter;
      }
      throttledSet(e.atom, e.value);
    }
  );
  return throttledOnEvent;
}

/**
 * Wraps an atom, returning a new atom that has it's set function throttled
 */
export function throttleAtom<R, W>(
  ms: number,
  atomToThrottle: WritableAtom<R, W[], void>
): WritableAtom<R, W[], void> {
  const throttleSet = throttledWriteAtom(ms);
  return atom(
    get => get(atomToThrottle),
    (get, set, next: W) =>
      set(throttleSet, { atom: atomToThrottle, value: next })
  );
}
