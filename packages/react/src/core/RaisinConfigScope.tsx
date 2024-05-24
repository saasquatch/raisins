import { createScope, molecule, ScopeProvider, use } from 'bunshi/react';
import { atom, Atom, PrimitiveAtom } from 'jotai';
import React, { useMemo } from 'react';
import { AttributeConfig } from '../attributes/AttributeConfig';
import { CanvasConfig } from '../canvas/CanvasConfig';
import { Module } from '../component-metamodel/types';

export type RaisinConfig = Partial<CanvasConfig> &
  Partial<AttributeConfig> & {
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
export type RaisinConfigMolecule = Molecule<Partial<RaisinConfig>>;

type ScopeValue = { molecule: RaisinConfigMolecule };
const configScope = createScope<ScopeValue | undefined>(undefined);
configScope.displayName = 'ConfigScope';

export const ConfigMolecule = molecule<RaisinConfig>(() => {
  /**
   * This will create a new set of atoms for every {@link configScope}
   */
  const config = use(configScope);
  if (!config)
    throw new Error(
      'Must use this molecule in a wrapping <RaisinsProvider> element'
    );

  const LocalURLAtom = atom<string | undefined>(undefined);
  LocalURLAtom.debugLabel = 'LocalURLAtom';

  const HTMLAtom = atom('');
  HTMLAtom.debugLabel = 'HTMLAtom';

  const provided = use(config.molecule) as Partial<RaisinConfig>;

  return {
    ...provided,
    LocalURLAtom: provided.LocalURLAtom ?? atom(undefined),
    PackagesAtom: provided.PackagesAtom ?? atom<Module[]>([]),
    uiWidgetsAtom: provided.uiWidgetsAtom ?? atom({}),
    HTMLAtom: provided.HTMLAtom ?? HTMLAtom,
  };
});

/**
 * Provides a scope for editing a {@link RaisinConfigMolecule}
 */
export const ConfigScopeProvider = ({
  molecule,
  children,
}: {
  molecule: RaisinConfigMolecule;
  children: React.ReactNode;
}) => {
  const scopeValue: ScopeValue = useMemo(() => ({ molecule }), [molecule]);
  return (
    <ScopeProvider scope={configScope} value={scopeValue}>
      {children}
    </ScopeProvider>
  );
};

export const RaisinsProvider = ConfigScopeProvider;
