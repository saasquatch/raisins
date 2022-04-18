import { atom } from 'jotai';
import {
  createScope,
  molecule
} from 'jotai-molecules';
import { RaisinProps } from './core/RaisinPropsScope';
import { Module } from './util/NPMRegistry';
import { noRenderers } from './index.stories';

export const StoryScope = createScope({
  startingHtml: '<span>I am a span</span>',
  startingPackages: [] as Module[],
  renderers: noRenderers,
  StateWrapper: molecule(() => atom([]))
});
export const StoryMolecule = molecule<Partial<RaisinProps>>((getMol, getScope) => {
  const storyScope = getScope(StoryScope);
  return {
    HTMLAtom: atom(storyScope.startingHtml),
    PackagesAtom: atom(storyScope.startingPackages),
    uiWidgetsAtom: atom({}),
    CanvasRenderers: storyScope.renderers
  };
});
