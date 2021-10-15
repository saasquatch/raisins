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
import {
  historyStack,
  root,
  rootPrimitive,
  rootWithHistory,
  selection,
} from '../src/atoms/_atoms';
import { RichTextEditorForAtom } from '../src/views/RichTextEditor';
import { useChildAtoms } from './childAtomRouter';
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
    rootWithHistory,
    // No-op remove on root? Could set to empty document.
    () => {}
  );
  const { childAtoms } = useChildAtoms(rootPrimitive);
  return (
    <>
      <Toolbar />
      <NodeEditorView {...props}>
        {childAtoms.map((childAtom) => {
          return (
            <ChildNodeEditor
              key={`${childAtom.node}`}
              // Good - from the book
              primitive={childAtom.node}
              // Good - derived from parent
              selectedAtom={childAtom.selected}
              // Good - derived from parent
              nodeProps={childAtom.nodeProps}
              // OK - prop drilling could be smarter
              nodeWithHistory={rootWithHistory}
              remove={childAtom.remove}
            />
          );
        })}
      </NodeEditorView>
    </>
  );
}

function ChildNodeEditor({
  primitive,
  selectedAtom,
  nodeProps,
  nodeWithHistory,
  remove,
}) {
  const props = useNodeEditor(
    primitive,
    selectedAtom,
    nodeProps,
    nodeWithHistory,
    remove
  );
  const { childAtoms } = useChildAtoms(primitive);
  return (
    <>
      <NodeEditorView {...props}>
        {childAtoms.map((childAtom) => {
          return (
            <ChildNodeEditor
              key={`${childAtom.node}`}
              // Good - from the book
              primitive={childAtom.node}
              // Good - derived from parent
              selectedAtom={childAtom.selected}
              // Good - derived from parent
              nodeProps={childAtom.nodeProps}
              // OK - prop drilling could be smarter
              nodeWithHistory={nodeWithHistory}
              remove={childAtom.remove}
            />
          );
        })}
        <RichTextEditorForAtom nodeAtom={primitive} />
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
