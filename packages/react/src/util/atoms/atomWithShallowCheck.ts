import { shallowEqual } from "fast-equals";
import type { Atom } from "jotai";
import { atomWithEqualCheck } from "./atomWithEqualCheck.tsx";

export const atomWithShallowCheck = <T>(baseAtom: Atom<T>) =>
  atomWithEqualCheck(baseAtom, shallowEqual);
