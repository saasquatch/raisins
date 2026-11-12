import { htmlParser } from '@raisins/core';
import { atom, useAtom } from 'jotai';
import { molecule, ScopeProvider, useMolecule } from 'bunshi/react';
import React from 'react';
import type { RaisinConfig } from '../../core/RaisinConfigScope.tsx';
import { RaisinsProvider } from '../../core/RaisinConfigScope.tsx';
import { NodeChildrenEditor } from '../NodeChildrenEditor.tsx';
import { NodeScopeMolecule, NodeScopeProvider } from '../NodeScope.tsx';
import {
  SlotScope,
  SlotScopeMolecule,
  SlotScopeProvider,
} from './SlotScope.tsx';

export default {
  title: 'Slot scope',
};

const StoryMolecule = molecule<Partial<RaisinConfig>>(() => {
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
      <NodeScopeProvider
        nodeAtom={atom(htmlParser('<div>I am a div</div>')) as any}
      >
        <TestComponent />
        <ScopeProvider scope={SlotScope} value={'foo'}>
          <TestComponent />
          <NodeChildrenEditor Component={TestComponent as any} />
          <NodeScopeProvider
            nodeAtom={atom(htmlParser('<div>I am a div</div>')) as any}
          >
            <TestComponent />
          </NodeScopeProvider>
          <TestComponent />
        </ScopeProvider>
      </NodeScopeProvider>
    </RaisinsProvider>
  );
};
const TestComponent = () => {
  const slot = useMolecule(SlotScopeMolecule);
  const nodeAtom = useMolecule(NodeScopeMolecule);
  const [node] = useAtom(nodeAtom);
  return (
    <div>
      Slot is: {slot} ({typeof slot}) in {(node as any).tagName}
    </div>
  );
};
