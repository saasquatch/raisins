import { atom, PrimitiveAtom } from 'jotai';
import { useRef } from 'react';
import { ProseTextSelection } from './ProseEditor';

/**
 * Use this to set up local selection state in a React component;
 *
 * @returns a selection state atom
 */

export function useSelectionAtom() {
  return useRef<PrimitiveAtom<ProseTextSelection | undefined>>(
    atom(undefined) as any
  ).current;
}
