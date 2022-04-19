import { atom, Atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { ConfigMolecule } from '../core/RaisinConfigScope';

export type CanvasConfig = {
  /**
   * Used for identifying targets across the iframe boundary
   */
  SoulAttributeAtom: Atom<string>;
};

export const CanvasConfigMolecule = molecule<CanvasConfig>((getMol) => {
  const props = getMol(ConfigMolecule);

  return {
    SoulAttributeAtom: props.SoulAttributeAtom ?? atom('raisins-soul'),
  };
});
