import { atom, Atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { atomWithProxy } from 'jotai/valtio';
import { proxySet } from 'valtio/utils';
import { SnabdomAppender, SnabdomRenderer } from './raisinToSnabdom';
import { ConfigMolecule } from '../core/RaisinConfigScope';

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

export const CanvasConfigMolecule = molecule((getMol) => {
  const props = getMol(ConfigMolecule);

  const AppendersSet = proxySet<Atom<SnabdomAppender>>([]);
  const RendererSet = proxySet<Atom<SnabdomRenderer>>([]);
  return {
    SoulAttributeAtom: props.SoulAttributeAtom ?? atom('raisins-soul'),
    EventSelectorAtom: props.EventSelectorAtom ?? atom('[raisins-events]'),
    AppendersSet,
    AppendersAtom: atomWithProxy(AppendersSet),
    RendererSet,
    RendererAtom: atomWithProxy(RendererSet),
  };
});
