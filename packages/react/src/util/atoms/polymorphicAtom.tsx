import { atom, PrimitiveAtom, WritableAtom } from 'jotai';
import { createMemoizeAtom } from '../weakCache';

const memoizeAtom = createMemoizeAtom();

/**
 * @param nodeAtom
 * @param router
 */
export function polymorphicAtom<T, V, A>(
  nodeAtom: PrimitiveAtom<T>,
  router: (
    node: T,
    nodeAtom: PrimitiveAtom<T>
  ) => WritableAtom<V, A[], void> | undefined
) {
  return memoizeAtom(
    () =>
      atom(
        get => {
          const value = get(nodeAtom);
          const atomForType = router(value, nodeAtom);
          if (!atomForType) return undefined;
          return get(atomForType);
        },
        (get, set, action: A) => {
          const value = get(nodeAtom);
          const atomForType = router(value, nodeAtom);
          if (!atomForType) return;
          set(atomForType, action);
        }
      ),
    [nodeAtom, router]
  );
}
