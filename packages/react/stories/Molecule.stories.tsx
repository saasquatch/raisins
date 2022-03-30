import { Meta } from '@storybook/react';
import { atom, useAtom } from 'jotai';
import React, { useContext, useMemo, useState } from 'react';
import { createMemoizeAtom } from '../src/util/weakCache';
import { discoverDependencies } from './molecules/discoverDependencies';
const meta: Meta = {
  title: 'Molecule',
};
export default meta;

const TenantScope = createScope<string>('tenant-a');
const UserScope = createScope<string>('user-a');

function createScope<T>(defaultValue: T): MoleculeScope<T> {
  const wrapped = React.createContext<T>(defaultValue);
  const Provider = ({
    children,
    value,
  }: {
    children?: React.ReactNode;
    value?: T;
  }) => (
    <wrapped.Provider value={value ?? defaultValue}>
      {children}
    </wrapped.Provider>
  );
  return { defaultValue, wrapped, Provider };
}

export type MoleculeScope<T> = {
  defaultValue: T;
  wrapped: React.Context<T>;
  Provider: React.FC<{
    children?: React.ReactNode;
    value?: T;
    scope?: unknown;
  }>;
};

export type MoleculeGetter<T = unknown> = (mol: Molecule<T>) => T;
export type ScopeGetter<T = unknown> = (ctx: MoleculeScope<T>) => T;

export type Getter<T> = (
  getMolecule: MoleculeGetter,
  getScope: ScopeGetter
) => T;
export type Molecule<T> = ReturnType<typeof molecule>;
function molecule<T>(getter: Getter<T>) {
  return { getter };
}

const memoize = createMemoizeAtom();

function useMolecule<T>(m: Molecule<T>): T {
  const { scopes, molecules } = useMemo(() => discoverDependencies(m), [m]);

  const realGetContext: ScopeGetter = (ctx) => {
    return useContext(scopes.find((a) => a.wrapped === ctx.wrapped).wrapped);
  };

  // Get real value, memoized based on context
  const realGetMolecule = (mol: Molecule<unknown>) => {
    // return memoize(() => {
    const real = mol.getter(realGetMolecule, realGetContext);
    return real;
    // }, [...contexts, ...molecules]);
  };

  return realGetMolecule(m) as T;
}

const coreAtoms = molecule((getMolecule, getScope) => {
  return { basicAtom: atom(getScope(TenantScope as any) + ' name') };
});

const editAtoms = molecule((getMolecule, getScope) => {
  const core = getMolecule(coreAtoms) as any;
  const userId = getScope(UserScope as any) as string;
  return {
    user: atom((get) => userId),
    basicAtom: atom((get) => (get(core.basicAtom) as string).toUpperCase()),
  };
});

function Component() {
  const core = useMolecule(coreAtoms) as any;
  const [cname, setCName] = useAtom(core.basicAtom);

  const atoms = useMolecule(editAtoms) as any;
  const [name] = useAtom(atoms.basicAtom);

  return (
    <div style={{ border: '1px solid grey', padding: '30px' }}>
      {cname}
      <input
        type="text"
        value={cname as string}
        onChange={(e) => setCName(e.target.value)}
      />
      <br />
      Upper: {name}
    </div>
  );
}

export function Example() {
  const [state, setState] = useState('user_a');
  return (
    <div>
      <input
        type="text"
        value={state}
        onChange={(e) => setState(e.target.value)}
      />
      <TenantScope.Provider value={state}>
        <Component />
      </TenantScope.Provider>
      <TenantScope.Provider>
        <Component />
      </TenantScope.Provider>
      <TenantScope.Provider value="user_a">
        <Component />
        <TenantScope.Provider value="user_a">
          <Component />
        </TenantScope.Provider>
      </TenantScope.Provider>
      <TenantScope.Provider value="user_a">
        <Component />
      </TenantScope.Provider>
    </div>
  );
}

export function Simple() {
  return <div>I am a thing</div>;
}
