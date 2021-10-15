import {
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNode,
} from '@raisins/core';
import { Meta } from '@storybook/react';
import { ElementType } from 'domelementtype';
import { atom, PrimitiveAtom, Provider, useAtom } from 'jotai';
import { splitAtom, useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { atomForChildren } from '../src/atoms/atomForChildren';
import {
  atomWithHistory,
  primitiveFromHistory,
} from '../src/atoms/atomWithHistory';
import { atomWithId } from '../src/atoms/atomWithId';
import { atomWithNodePath } from '../src/atoms/atomWithNodePath';
import { atomWithNodeProps } from '../src/atoms/atomWithNodeProps';
import { atomWithSelection } from '../src/atoms/atomWithSelection';
import { atomWithToggle } from '../src/atoms/atomWithToggle';
import { root, selection } from '../src/atoms/_atoms';
import { NodeEditorView } from './NodeEditorView';
import { useNodeEditor } from './useNodeEditor';

const meta: Meta = {
  title: 'Jotai',
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

const nodeWithHistory = atomWithHistory(initialNode);
const primitive = primitiveFromHistory<RaisinNode>(nodeWithHistory);

const rootWithHistory = atomWithHistory<RaisinNode>(initialRoot);
const rootPrimitive = primitiveFromHistory(rootWithHistory);

// const selectedAtom = atomWithToggle(false);
// const nodeProps = atom({});

export function RootPlayground() {
  return (
    <Provider>
      <RootPlaygroundInner />
    </Provider>
  );
}

function Toolbar() {
  const dispatch = useUpdateAtom(rootWithHistory);
  const undo = useCallback(() => dispatch({ type: 'undo' }), [dispatch]);
  const redo = useCallback(() => dispatch({ type: 'redo' }), [dispatch]);
  const selected = useAtomValue(selection);

  return (
    <div>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
      Selected: {JSON.stringify(selected)}
    </div>
  );
}
function RootPlaygroundInner() {
  const [, setRootNode] = useAtom(root);
  useEffect(() => {
    // Initial state
    setRootNode(initialRoot as RaisinNode);
  }, []);
  const props = useNodeEditor(
    rootPrimitive,
    atomWithSelection(rootPrimitive),
    atomWithNodeProps(rootPrimitive),
    rootWithHistory
  );
  const { childAtoms, removeChild } = useChildAtoms(rootPrimitive);
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
              nodeWithHistory={nodeWithHistory}
              remove={childAtom.remove}
            />
          );
        })}
      </NodeEditorView>
    </>
  );
}

export function NodePlayground() {
  const primitiveWithId = atomWithId(primitive);
  const props = useNodeEditor(
    primitiveWithId,
    atomWithSelection(primitiveWithId),
    atomWithNodeProps(primitiveWithId),
    nodeWithHistory
  );
  const { childAtoms, removeChild } = useChildAtoms(primitiveWithId);
  return (
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
    </NodeEditorView>
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
    nodeWithHistory
  );
  const { childAtoms, removeChild } = useChildAtoms(primitive);
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
      </NodeEditorView>
      <button onClick={remove}>Remove child</button>
    </>
  );
}

export function SynchedStatePlayground() {
  return (
    <Provider>
      <NodePlayground />
      <NodePlayground />
    </Provider>
  );
}
export function SplitStatePlayground() {
  return (
    <Provider>
      <Provider>
        <NodePlayground />
      </Provider>
      <Provider>
        <NodePlayground />
      </Provider>
    </Provider>
  );
}
function useChildAtoms(nodeAtom: PrimitiveAtom<RaisinNode>) {
  const [childAtoms, removeChild] = useAtom(
    splitAtom(atomForChildren(nodeAtom))
  );

  return {
    childAtoms: childAtoms
      .map((c) => atomWithId(c as any))
      .map((c) => ({
        node: c,
        selected: atomWithSelection(c),
        nodeProps: atomWithNodeProps(c),
        remove: () => removeChild(c),
      })),
    removeChild,
  };
}

const a = `{"google":"homepage"}`;
const b = `{"google":"nomepage"}`;
const str = atom(a);
const node = atom<{ google: string }>((get) => JSON.parse(get(str)));

export const JSONMemoized = () => {
  const One = () => {
    const [val, setVal] = useAtom(str);
    return (
      <div>
        String: {val}
        <button onClick={() => setVal((v) => (v === a ? b : a))}>swap</button>
      </div>
    );
  };

  const Two = () => {
    const [obj] = useAtom(node);
    const renderCount = useRef(0);
    const [cnt, setCnt] = useState(0);
    useEffect(() => {
      renderCount.current++;
    }, [obj]);

    return (
      <div>
        Render count {renderCount.current} {obj.google} <br />
        {cnt} <button onClick={() => setCnt((c) => c + 1)}>+1</button>
      </div>
    );
  };

  return (
    <div>
      <One />
      <Two />
    </div>
  );
};
