import { PrimitiveAtom } from 'jotai';
import { ScopeProvider } from 'jotai-molecules';
import React from 'react';
import { CoreEditorScope } from './CoreAtoms';

// Scopes the "Jotai" store
//
// See: https://jotai.pmnd.rs/docs/api/core#provider

export const RaisinScope = Symbol('Raisin Scope');

export const RaisinsProvider = ({
  htmlAtom,
  children,
}: {
  htmlAtom: PrimitiveAtom<string>;
  children: React.ReactNode;
}) => {
  /**
   * FIXME: React profiling has revealed that this is removing the benefits of jotai re-rendering, and causing lots of downstream renders
   */
  return (
    <ScopeProvider scope={CoreEditorScope} value={htmlAtom}>
      {children}
    </ScopeProvider>
  );
};
