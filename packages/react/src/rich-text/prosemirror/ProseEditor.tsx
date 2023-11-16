import { useAtom } from 'jotai';
import { ScopeProvider, useMolecule } from 'bunshi/react';
import React from 'react';
import { ProseEditorMolecule } from './ProseEditorMolecule';
import { ProseEditorViewScope } from './ProseEditorViewMolecule';

export const ProseEditor = () => {
  return (
    <ScopeProvider scope={ProseEditorViewScope} uniqueValue>
      <ProseEditorInner />
    </ScopeProvider>
  );
};

const ProseEditorInner = () => {
  const elementRef = useMolecule(ProseEditorMolecule);
  /*
   * NOTE(lv): Needs to subscribe to value, even though it is never used.
   * Otherwise nothing kicks off the atom subscription process
   */
  const [, mountRef] = useAtom(elementRef.view.elementAtom);
  return <div ref={mountRef} />;
};
