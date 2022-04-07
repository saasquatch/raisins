import { htmlParser } from '@raisins/core';
import { atom, useAtom } from 'jotai';
import { molecule, ScopeProvider, useMolecule } from 'jotai-molecules';
import React from 'react';
import { RaisinProps } from '../../core/CoreAtoms';
import { RaisinsProvider } from '../../core/RaisinsProvider';
import { ChildrenEditor } from '../children/ChildrenEditor';
import { NodeAtomMolecule, NodeAtomProvider } from '../NodeScope';
import { SlotScope, SlotScopeMolecule, SlotScopeProvider } from './SlotScope';

export default {
  title: 'Slot scope',
};

const StoryMolecule = molecule<Partial<RaisinProps>>(() => {
  return {
    HTMLAtom: atom('<div>I am a div</div>'),
    PackagesAtom: atom([] as any),
    uiWidgetsAtom: atom({}),
  };
});

export const Test2 = () => {
  return (
    <SlotScopeProvider slot={'test'}>
      <TestComponent />
    </SlotScopeProvider>
  );
};
export const Test1 = () => {
  return (
    <RaisinsProvider molecule={StoryMolecule}>
      <NodeAtomProvider
        nodeAtom={atom(htmlParser('<div>I am a div</div>')) as any}
      >
        <TestComponent />
        <ScopeProvider scope={SlotScope} value={'foo'}>
          <TestComponent />
          <ChildrenEditor Component={TestComponent as any} />
          <NodeAtomProvider
            nodeAtom={atom(htmlParser('<div>I am a div</div>')) as any}
          >
            <TestComponent />
          </NodeAtomProvider>
          <TestComponent />
        </ScopeProvider>
      </NodeAtomProvider>
    </RaisinsProvider>
  );
};
const TestComponent = () => {
  const slot = useMolecule(SlotScopeMolecule);
  const nodeAtom = useMolecule(NodeAtomMolecule);
  const [node] = useAtom(nodeAtom);
  return (
    <div>
      Slot is: {slot} ({typeof slot}) in {(node as any).tagName}
    </div>
  );
};
