import { isElementNode, isRoot, RaisinNode } from '@raisins/core';
import { useAtom, useAtomValue } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import React, { useContext } from 'react';
import { ConfigMolecule } from '../core';
import { CoreMolecule } from '../core/CoreAtoms';
import { invalidTBody } from '../examples/HTMLComponents';
import { BasicStory } from '../index.stories';
import { example } from './children/LoadTest.example';
import {
  ForkedChildrenEditor,
  ForkedContext,
  NodeChildrenEditor,
} from './NodeChildrenEditor';
import { NodeMolecule } from './NodeMolecule';
import { NodeScopeMolecule } from './NodeScope';

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

export const JsonPointersTest = () => {
  return (
    <BasicStory startingHtml={example}>
      <JsonPointers />
    </BasicStory>
  );
};

export const HTMLValidationTest = () => {
  return (
    <BasicStory startingHtml={invalidTBody}>
      <ValidationTest />
    </BasicStory>
  );
};

const ValidationTest = () => {
  const [html, setHtml] = useAtom(useMolecule(ConfigMolecule).HTMLAtom);

  return (
    <>
      <textarea
        value={html}
        onInput={(e) => setHtml((e.target as HTMLTextAreaElement).value)}
        rows={6}
        style={{ width: '300px' }}
      />
      <JsonPointers />
    </>
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

const JsonPointers = () => {
  const nodeAtoms = useMolecule(NodeMolecule);
  const hasErrors = useAtomValue(nodeAtoms.hasErrorsAtom);
  const allErrors = useAtomValue(nodeAtoms.errorsAtom);
  const errors = useAtomValue(nodeAtoms.attributeErrorsAtom);
  const tagName = useAtomValue(nodeAtoms.tagNameAtom);
  return (
    <div>
      {tagName ?? 'Root'}
      {errors.length > 0 && (
        <>
          <p>Errors for this node</p>
          <ul>
            {errors.map((e) => (
              <li>
                {e.jsonPointer} - {e.error.rule}
              </li>
            ))}
          </ul>
        </>
      )}
      <details>
        <summary>Children ({allErrors.length} errors)</summary>

        <div style={{ borderLeft: '4px solid #CCC' }}>
          <NodeChildrenEditor Component={JsonPointers} />
        </div>
      </details>
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
