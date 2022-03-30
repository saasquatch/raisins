import { Meta } from '@storybook/react';
import { atom, useAtom } from 'jotai';
import React, { useContext, useMemo, useState } from 'react';
import { createMemoizeAtom } from '../src/util/weakCache';
import { discoverDependencies } from './molecules/discoverDependencies';
const meta: Meta = {
  title: 'Molecule',
};
export default meta;

const TenantScope = createScope<string>('Red Bull');
const UserScope = createScope<string>('Bob');

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
export type Molecule<T> = {
  getter: Getter<T>;
  displayName?: string;
};
function molecule<T>(getter: Getter<T>): Molecule<T> {
  return { getter };
}

const memoize = createMemoizeAtom();

function useMolecule<T>(m: Molecule<T>): T {
  const { scopes, molecules } = useMemo(() => discoverDependencies(m), [m]);

  const scopeValues = scopes.map((s) => ({
    value: useContext(s.wrapped),
    scope: s,
  }));

  const realGetScope: ScopeGetter = (ctx) => {
    return scopeValues.find((a) => a.scope.wrapped === ctx.wrapped).value;
  };

  // Get real value, memoized based on context
  const realGetMolecule = (mol: Molecule<unknown>) => {
    const { scopes, molecules } = discoverDependencies(mol);
    const scopeValues = scopes.map((s) => ({
      value: useContext(s.wrapped),
      scope: s,
    }));

    return memoize(() => {
      console.log('Mounting a new molecule', mol, scopeValues, molecules);
      const real = mol.getter(realGetMolecule, realGetScope);
      return real;
    }, [...scopeValues, ...molecules]);
  };

  return realGetMolecule(m) as T;
}

const coreAtoms = molecule(function createCore(getMolecule, getScope) {
  return { basicAtom: atom(getScope(TenantScope as any) + '  Inc.') };
});

const editAtoms = molecule(function createEdit(getMolecule, getScope) {
  const core = getMolecule(coreAtoms) as any;
  const userId = getScope(UserScope as any) as string;
  return {
    user: atom((get) => userId),
    preference: atom(
      (get) => (userId + ' likes ' + get(core.basicAtom)) as string
    ),
  };
});

function Component() {
  const tenant = useContext(TenantScope.wrapped);
  const user = useContext(UserScope.wrapped);
  const core = useMolecule(coreAtoms) as any;
  const [cname, setCName] = useAtom(core.basicAtom);

  const edits = useMolecule(editAtoms) as any;
  const [name] = useAtom(edits.preference);

  return (
    <div style={{ border: '1px solid grey', padding: '30px' }}>
      Tenant: {tenant}
      <br />
      User: {user}
      <br />
      Company Name: {cname} <br />
      <input
        type="text"
        value={cname as string}
        onChange={(e) => setCName(e.target.value)}
      />
      <br />
      Preference: {name}
    </div>
  );
}

export function Example() {
  const [state, setState] = useState('Android');
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
      <TenantScope.Provider value="pepsi">
        <Component />
        <TenantScope.Provider value="coke">
          <Component />
        </TenantScope.Provider>
      </TenantScope.Provider>
      <TenantScope.Provider value="pepsi">
        <Component />
      </TenantScope.Provider>
    </div>
  );
}

export function Simple() {
  return <div>I am a thing</div>;
}
