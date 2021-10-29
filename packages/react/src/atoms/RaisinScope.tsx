import {
  atom,
  Provider,
  Setter,
  useAtom,
  WritableAtom,
  SetStateAction as JotaiSetStateAction,
  PrimitiveAtom,
} from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import React, { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import { LocalURLAtom } from '../component-metamodel/ComponentModel';
import { useAtomFromRenderValue } from './useValueAtom';

// Scopes the "Jotai" store
//
// See: https://jotai.pmnd.rs/docs/api/core#provider

export const RaisinScope = Symbol('Raisin Scope');

type StateTuple<T> = [T, Dispatch<SetStateAction<T>>];
export const RaisinsProvider = ({
  state,
  children,
}: {
  state: StateTuple<string>;
  children: React.ReactNode;
}) => {
  return (
    <Provider
      scope={RaisinScope}
      initialValues={[
        // TODO: Make this configurable
        // Local atom
        [LocalURLAtom, 'http://localhost:5000'],
      ]}
    >
      <ConnectState stateTuple={state} />
      {children}
    </Provider>
  );
};

const defaultNeverUsedAtom: PrimitiveAtom<string> = atom('');
export const HTMLAtomAtom: PrimitiveAtom<PrimitiveAtom<string>> = atom(
  defaultNeverUsedAtom
);

export const HTMLAtom: PrimitiveAtom<string> = atom(
  (get) => {
    const htmlAtom = get(HTMLAtomAtom);
    return get(htmlAtom);
  },
  (get, set, next: SetStateAction<string>) => {
    const htmlAtom = get(HTMLAtomAtom);
    set(htmlAtom, next);
  }
);

function ConnectState({ stateTuple }: { stateTuple: StateTuple<string> }) {
  const [state, setState] = stateTuple;

  const baseAtom = useMemo(() => atom(state), []);
  const derivedAtom = useMemo(
    () =>
      atom(
        (get) => get(baseAtom),
        (_, _1, next: JotaiSetStateAction<string>) => setState(next)
      ),
    [setState]
  );

  /**
   * On render, pushes hte value into the `baseAtom`
   */
  const setBase = useUpdateAtom(baseAtom, RaisinScope);
  useEffect(() => {
    setBase(state);
  }, [state]);

  /*
   * On render if the currently focused state atom doesn't have state, ignore
   */
  const [stateAtom, setStateAtom] = useAtom(HTMLAtomAtom, RaisinScope);
  useEffect(() => {
    if (stateAtom !== derivedAtom) {
      setStateAtom(derivedAtom);
    }
  }, [baseAtom]);

  // Return nothing, just needs to be rendered in the right React context / Jotai context
  return <></>;
}
