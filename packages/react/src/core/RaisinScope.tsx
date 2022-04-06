import { ScopeProvider } from 'jotai-molecules';
import React from 'react';
import { PropsScope, RaisinPropsMolecule } from './CoreAtoms';

export const RaisinsProvider = ({
  molecule,
  children,
}: {
  molecule: RaisinPropsMolecule;
  children: React.ReactNode;
}) => {
  /**
   * FIXME: React profiling has revealed that this is removing the benefits of jotai re-rendering, and causing lots of downstream renders
   */
  return (
    <ScopeProvider scope={PropsScope} value={molecule}>
      {children}
    </ScopeProvider>
  );
};
