import { atom, WritableAtom } from 'jotai';

/**
 * Boolean toggle, based on: https://github.com/pmndrs/jotai/blob/main/docs/advanced-recipes/atom-creators.mdx
 *
 * @param initialValue
 * @returns
 */
export function atomWithToggle(
    initialValue?: boolean): WritableAtom<boolean, boolean | undefined> {
    const anAtom = atom(initialValue, (get, set, nextValue?: boolean) => {
        const update = nextValue ?? !get(anAtom);
        set(anAtom, update);
    });

    return anAtom as WritableAtom<boolean, boolean | undefined>;
}
