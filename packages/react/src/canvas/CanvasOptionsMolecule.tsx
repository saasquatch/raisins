import { atom, Atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { PropsMolecule } from '../core/RaisinPropsScope';

export type CanvasOptions = {
  /**
   * Used for identifying targets across the iframe boundary
   */
  SoulAttributeAtom: Atom<string>;
};

export const CanvasOptionsMolecule = molecule<CanvasOptions>((getMol) => {
  const props = getMol(PropsMolecule);

  return {
    SoulAttributeAtom: props.SoulAttributeAtom ?? atom('raisins-soul'),
  };
});
