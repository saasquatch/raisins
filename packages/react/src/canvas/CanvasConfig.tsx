import { atom, Atom } from 'jotai';
import { molecule } from 'bunshi/react';
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

  /**
   * Predicate for containers that lay out their own plop targets (e.g.
   * tables that render injected targets as column headers). During a drag
   * these containers get plop targets injected and hit-tested directly;
   * all other containers use gap-geometry drop resolution.
   */
  CustomPlopContainersAtom: Atom<(tagName: string) => boolean>;

  /**
   * HTML content to be rendered in the head of the iframe.
   *
   * NOTE: Changing this will cause a full re-render, so this
   * should only be used for truly static content, such as styles
   * or scripts tags.
   */
  IframeHead: Atom<string>;
};

const noCustomPlopContainers = () => false;

export const CanvasConfigMolecule = molecule((getMol) => {
  const props = getMol(ConfigMolecule);

  return {
    IframeHead: props.IframeHead,
    SoulAttributeAtom: props.SoulAttributeAtom ?? atom('raisins-soul'),
    EventAttributeAtom: props.EventSelectorAtom ?? atom('raisins-events'),
    CustomPlopContainersAtom:
      props.CustomPlopContainersAtom ?? atom(() => noCustomPlopContainers),
  };
});
