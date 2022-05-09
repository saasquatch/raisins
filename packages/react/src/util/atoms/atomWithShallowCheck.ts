import { Atom } from 'jotai';
import shallowEqual from '../shallowEqual';
import { atomWithEqualCheck } from './atomWithEqualCheck';

export const atomWithShallowCheck = <T>(baseAtom: Atom<T>) =>
  atomWithEqualCheck(baseAtom, shallowEqual);
