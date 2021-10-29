import {
  htmlParser,
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNode,
} from '@raisins/core';
import { Meta } from '@storybook/react';
import { ElementType } from 'domelementtype';
import { Provider, useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { useCallback, useEffect } from 'react';
import { atomWithNodeProps } from '../src/atoms/atomWithNodeProps';
import { atomWithSelection } from '../src/atoms/atomWithSelection';
import { useNodeAtom } from '../src/node/node-context';
import {
  historyStack,
  root,
  rootPrimitive,
  rootWithHistory,
  selection,
} from '../src/atoms/_atoms';
import { getDerivedAtoms } from '../src/controllers/childAtomRouter';
import { ChildrenEditor } from '../src/controllers/ChildrenEditor';
import { RichTextEditorForAtom } from '../src/rich-text/RichTextEditor';
import { NodeEditorView } from './NodeEditorView';
import { useNodeEditor } from './useNodeEditor';

const meta: Meta = {
  title: 'Editor (via Jotai)',
};
export default meta;

const initialNode: RaisinNode = {
  type: ElementType.Tag,
  tagName: 'span',
  attribs: {},
  children: [
    {
      type: ElementType.Tag,
      tagName: 'my-child',
      attribs: {},
      children: [
        {
          type: ElementType.Tag,
          tagName: 'span',
          attribs: {},
          children: [
            {
              type: ElementType.Tag,
              tagName: 'my-child',
              attribs: {},
              children: [],
            } as RaisinElementNode,
            {
              type: ElementType.Tag,
              tagName: 'my-child',
              attribs: {},
              children: [],
            } as RaisinElementNode,
          ],
        } as RaisinElementNode,
      ],
    } as RaisinElementNode,
    {
      type: ElementType.Tag,
      tagName: 'my-child',
      attribs: {},
      children: [],
    } as RaisinElementNode,
  ],
} as RaisinElementNode;
const initialRoot: RaisinDocumentNode = {
  type: ElementType.Root,
  children: [initialNode],
};

export function RootPlayground() {
  return (
    <Provider>
      <RootPlaygroundInner />
    </Provider>
  );
}

function Toolbar() {
  const dispatch = useUpdateAtom(rootWithHistory);
  const stack = useAtomValue(historyStack);
  const undo = useCallback(() => dispatch({ type: 'undo' }), [dispatch]);
  const redo = useCallback(() => dispatch({ type: 'redo' }), [dispatch]);
  const selected = useAtomValue(selection);

  return (
    <div>
      <button onClick={undo} disabled={stack.undo.length <= 0}>
        Undo
      </button>{' '}
      ({stack.undo.length})
      <button onClick={redo} disabled={stack.redo.length <= 0}>
        Redo
      </button>{' '}
      ({stack.redo.length}) Selected: {JSON.stringify(selected)}
    </div>
  );
}
function RootPlaygroundInner() {
  const [, setRootNode] = useAtom(root);
  useEffect(() => {
    // Initial state
    setRootNode(
      htmlParser(
        `<div><span>I have text</span><b>And I do too</b></div>`
      ) as RaisinNode
    );
  }, []);
  const props = useNodeEditor(
    rootPrimitive,
    atomWithSelection(rootPrimitive),
    atomWithNodeProps(rootPrimitive),
    rootWithHistory
  );
  return (
    <>
      <Toolbar />
      <NodeEditorView {...props}>
        <ChildrenEditor Component={ChildNodeEditor} />
        <></>
      </NodeEditorView>
    </>
  );
}

function ChildNodeEditor() {
  const base = useNodeAtom();

  const { node, selected, nodeProps } = getDerivedAtoms(base);
  const props = useNodeEditor(node, selected, nodeProps, rootWithHistory);
  return (
    <>
      <NodeEditorView {...props}>
        <ChildrenEditor Component={ChildNodeEditor} />
        <RichTextEditorForAtom />
      </NodeEditorView>
    </>
  );
}

export function SynchedStatePlayground() {
  return (
    <Provider>
      <RootPlaygroundInner />
      <RootPlaygroundInner />
    </Provider>
  );
}
export function SplitStatePlayground() {
  return (
    <Provider>
      <Provider>
        <RootPlaygroundInner />
      </Provider>
      <Provider>
        <RootPlaygroundInner />
      </Provider>
    </Provider>
  );
}
