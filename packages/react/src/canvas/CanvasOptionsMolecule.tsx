import { atom, Atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { Molecule } from 'jotai-molecules/dist/molecule';
import { PropsMolecule } from '../core/RaisinPropsScope';
import { SnabdomRenderer } from './raisinToSnabdom';

export type CanvasOptions = {
  /**
   * Used for identifying targets across the iframe boundary
   */
  SoulAttributeAtom: Atom<string>;
  CanvasRenderers: Molecule<Atom<SnabdomRenderer[]>>;
};

export const CanvasOptionsMolecule = molecule<CanvasOptions>((getMol) => {
  const props = getMol(PropsMolecule);
  return {
    SoulAttributeAtom: props.SoulAttributeAtom ?? atom('raisins-soul'),
    CanvasRenderers: props.CanvasRenderers ?? molecule(() => atom([])),
  };
});
