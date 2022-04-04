import {
  atom,
  PrimitiveAtom,
  SetStateAction as JotaiSetStateAction,
  useAtom,
} from 'jotai';
import { ScopeProvider } from 'jotai-molecules';
import { useUpdateAtom } from 'jotai/utils';
import React, { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import { CoreEditorScope } from './CoreAtoms';

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
  /**
   * FIXME: React profiling has revealed that this is removing the benefits of jotai re-rendering, and causing lots of downstream renders
   */
  return (
    <ScopeProvider scope={CoreEditorScope} uniqueValue>
      {children}
    </ScopeProvider>
  );
};

const defaultNeverUsedAtom: PrimitiveAtom<string> = atom(
  '<div><span>I am placeholder that should not exist</span></div>'
);
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
