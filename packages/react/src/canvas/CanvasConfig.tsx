import { atom, Atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { ConfigMolecule } from '../core/RaisinPropsScope';

export type CanvasConfig = {
  /**
   * Used for identifying the souls of elements
   *
   * Need to uniquely identify a node across the iframe boundary
   */
  SoulAttributeAtom: Atom<string>;
  /**
   * Selector for which types of elements will listened to
   * across the iframe boundary.
   *
   */
  EventSelectorAtom: Atom<string>;
};

export const CanvasConfigMolecule = molecule<CanvasConfig>((getMol) => {
  const props = getMol(ConfigMolecule);

  return {
    SoulAttributeAtom: props.SoulAttributeAtom ?? atom('raisins-soul'),
    EventSelectorAtom: props.EventSelectorAtom ?? atom('[raisins-events]'),
  };
});
