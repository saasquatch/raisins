import { isElementNode, isRoot, RaisinNode } from '@raisins/core';
import { useAtom } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import React, { useContext } from 'react';
import { CoreMolecule } from '../core/CoreAtoms';
import { BasicStory } from '../index.stories';
import { NodeScopeMolecule } from './NodeScope';
import {
  NodeChildrenEditor,
  ForkedChildrenEditor,
  ForkedContext,
} from './NodeChildrenEditor';
import { example } from './children/LoadTest.example';

export default {
  title: 'Children Editor',
};

export const LoadTest = () => {
  return (
    <BasicStory startingHtml={example}>
      <TestEditor />
    </BasicStory>
  );
};

export const ForkedLoadTest = () => {
  return (
    <BasicStory startingHtml={example}>
      <ForkedRoot />
    </BasicStory>
  );
};

const ForkedRoot = () => {
  const { RootNodeAtom } = useMolecule(CoreMolecule);
  return (
    <ForkedContext.Provider value={RootNodeAtom}>
      ForkedRoot
      <hr />
      <ForkedTestEditor />
    </ForkedContext.Provider>
  );
};

const ForkedTestEditor = () => {
  const nodeAtom = useContext(ForkedContext);
  const [node] = useAtom(nodeAtom!);
  const tagName = isElementNode(node) ? node.tagName : node.type;
  return (
    <div>
      {tagName}
      <div style={{ borderLeft: '4px solid #CCC' }}>
        <ForkedChildrenEditor Component={ForkedTestEditor} />
      </div>
    </div>
  );
};
const TestEditor = () => {
  const nodeAtom = useMolecule(NodeScopeMolecule);
  const [node] = useAtom(nodeAtom);
  const tagName = isElementNode(node) ? node.tagName : node.type;
  return (
    <div>
      {tagName}
      <div style={{ borderLeft: '4px solid #CCC' }}>
        <NodeChildrenEditor Component={TestEditor} />
      </div>
    </div>
  );
};

export const DumbLoadTest = () => {
  return (
    <BasicStory startingHtml={example}>
      <>
        Dumb Case <hr />
        <DumbCaseRoot />
      </>
    </BasicStory>
  );
};

const DumbCaseRoot = () => {
  const { RootNodeAtom } = useMolecule(CoreMolecule);
  const [node] = useAtom(RootNodeAtom);
  return <DumbCase node={node} />;
};

const DumbCase = ({ node }: { node: RaisinNode }) => {
  const tagName = isElementNode(node) ? node.tagName : node.type;
  const children = isElementNode(node) || isRoot(node) ? node.children : [];
  return (
    <div>
      {tagName}
      <div style={{ borderLeft: '4px solid #CCC' }}>
        {children.map((c) => (
          <DumbCase node={c} />
        ))}
      </div>
    </div>
  );
};
