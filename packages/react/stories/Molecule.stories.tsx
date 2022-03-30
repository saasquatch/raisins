import { Meta } from '@storybook/react';
import { atom, useAtom } from 'jotai';
import React, { useContext, useMemo, useState } from 'react';
import { createMemoizeAtom } from '../src/util/weakCache';
import { discoverDependencies } from './molecules/discoverDependencies';
const meta: Meta = {
  title: 'Molecule',
};
export default meta;

const StartContext = createContext<string>('Foo');

function createContext<T>(defaultValue: T): MoleculeContext<T> {
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

export type MoleculeContext<T> = {
  defaultValue: T;
  wrapped: React.Context<T>;
  Provider: React.FC<{
    children?: React.ReactNode;
    value?: T;
    scope?: unknown;
  }>;
};

export type MoleculeGetter<T = unknown> = (mol: Molecule<T>) => T;
export type ContextGetter<T = unknown> = (ctx: MoleculeContext<T>) => T;

export type Getter<T> = (
  getMolecule: MoleculeGetter,
  getContext: ContextGetter
) => T;
export type Molecule<T> = ReturnType<typeof molecule>;
function molecule<T>(getter: Getter<T>) {
  return { getter };
}

const memoize = createMemoizeAtom();
function useMolecule<T>(m: Molecule<T>): T {
  const { contexts, molecules } = useMemo(() => discoverDependencies(m), [m]);

  const realGetContext: ContextGetter = (ctx) => {
    return useContext(contexts.find((a) => a.wrapped === ctx.wrapped).wrapped);
  };

  // Get real value, memoized based on context
  const realGetMolecule = (mol: Molecule<unknown>) => {
    return memoize(() => {
      const real = mol.getter(realGetMolecule, realGetContext);
      return real;
    }, [...contexts, ...molecules]);
  };

  return realGetMolecule(m) as T;
}

const coreAtoms = molecule((getMolecule, getContext) => {
  return { basicAtom: atom(getContext(StartContext as any)) };
});

const editAtoms = molecule((getMolecule, getContext) => {
  const core = getMolecule(coreAtoms) as any;
  return {
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
  const [state, setState] = useState('external');
  return (
    <div>
      <input
        type="text"
        value={state}
        onChange={(e) => setState(e.target.value)}
      />
      <StartContext.Provider value={state}>
        <Component />
      </StartContext.Provider>
      <StartContext.Provider>
        <Component />
      </StartContext.Provider>
      <StartContext.Provider value="one">
        <Component />
        <StartContext.Provider value="two">
          <Component />
        </StartContext.Provider>
      </StartContext.Provider>
      <StartContext.Provider value="one">
        <Component />
      </StartContext.Provider>
    </div>
  );
}

export function Simple() {
  return <div>I am a thing</div>;
}
