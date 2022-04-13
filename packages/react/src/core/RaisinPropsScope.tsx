import { atom, Atom, PrimitiveAtom } from 'jotai';
import { createScope, ScopeProvider } from 'jotai-molecules';
import { molecule } from 'jotai-molecules';
import React from 'react';
import { CanvasOptions } from '../canvas/CanvasOptionsMolecule';
import { Module } from '../component-metamodel/types';

export type RaisinProps = Partial<CanvasOptions> & {
  /**
   * Atom for the primitive string value that will be read
   */
  HTMLAtom: PrimitiveAtom<string>;
  /**
   * Atom for the set of NPM packages
   */
  PackagesAtom: PrimitiveAtom<Module[]>;
  /**
   * Atom for the set of UI Widgets that can be use for editing attributes
   *
   * Read-only
   */
  uiWidgetsAtom: Atom<Record<string, React.FC>>;
  /**
   * When an NPM package is just `@local` then it is loaded from this URL
   *
   * Read-only
   */
  LocalURLAtom: Atom<string | undefined>;
};

type Molecule<T> = ReturnType<typeof molecule>;
/**
 * The core thing that needs to be provided to raisins for editing to be possible.
 *
 * Everything in raisins is in some way *derived state* from this molecule
 */
export type RaisinPropsMolecule = Molecule<Partial<RaisinProps>>;

const PropsScope = createScope<RaisinPropsMolecule | undefined>(undefined);
PropsScope.displayName = 'PropsScope';

export const PropsMolecule = molecule<RaisinProps>((getMol, getScope) => {
  /**
   * This will create a new set of atoms for every {@link PropsScope}
   */
  const props = getScope(PropsScope);
  if (!props)
    throw new Error(
      'Must use this molecule in a wrapping <RaisinsProvider> element'
    );

  const LocalURLAtom = atom<string | undefined>(undefined);
  LocalURLAtom.debugLabel = 'LocalURLAtom';

  const HTMLAtom = atom('');
  HTMLAtom.debugLabel = 'HTMLAtom';

  const provided = getMol(props) as Partial<RaisinProps>;

  return {
    LocalURLAtom: provided.LocalURLAtom ?? atom(undefined),
    PackagesAtom: provided.PackagesAtom ?? atom<Module[]>([]),
    uiWidgetsAtom: provided.uiWidgetsAtom ?? atom({}),
    HTMLAtom: provided.HTMLAtom ?? HTMLAtom,
  };
});

/**
 * Provides a scope for editing a {@link RaisinPropsMolecule}
 */
export const PropsScopeProvider = ({
  molecule,
  children,
}: {
  molecule: RaisinPropsMolecule;
  children: React.ReactNode;
}) => {
  return (
    <ScopeProvider scope={PropsScope} value={molecule}>
      {children}
    </ScopeProvider>
  );
};

export const RaisinsProvider = PropsScopeProvider;