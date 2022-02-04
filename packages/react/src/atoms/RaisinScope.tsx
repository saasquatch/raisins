import {
  atom,
  PrimitiveAtom,
  Provider,
  SetStateAction as JotaiSetStateAction,
  useAtom,
} from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import React, { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import { LocalURLAtom } from '../component-metamodel/ComponentModel';

// Scopes the "Jotai" store
//
// See: https://jotai.pmnd.rs/docs/api/core#provider

export const RaisinScope = Symbol('Raisin Scope');

type StateTuple<T> = [T, Dispatch<SetStateAction<T>>];
export const RaisinsProvider = ({
  stateTuple,
  children,
}: {
  stateTuple: StateTuple<string>;
  children: React.ReactNode;
}) => {
  const initialValues = useMemo(
    () => [
      // TODO: Make this configurable
      // Local atom
      [LocalURLAtom, 'http://localhost:5000'],
    ],
    [LocalURLAtom]
  );
  /**
   * FIXME: React profiling has revealed that this is removing the benefits of jotai re-rendering, and causing lots of downstream renders
   */
  return (
    <Provider
      scope={RaisinScope}
      initialValues={
        // TODO: 2D array type is dumb
        initialValues as any
      }
    >
      {/*
      FIXME: The re-render bug is here
      */}
      <ConnectState stateTuple={stateTuple} />
      {children}
    </Provider>
  );
};

const defaultNeverUsedAtom: PrimitiveAtom<string> = atom('<span>I am bold</span>');
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
