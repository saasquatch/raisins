import {
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNode,
} from '@raisins/core';
import { Meta } from '@storybook/react';
import { ElementType } from 'domelementtype';
import { atom, PrimitiveAtom, Provider, useAtom } from 'jotai';
import { splitAtom } from 'jotai/utils';
import React, { useEffect, useRef, useState } from 'react';
import { atomForChildren } from './atomForChildren';
import { atomWithHistory, primitiveFromHistory } from './atomWithHistory';
import { atomWithNodePath } from './atomWithNodePath';
import { atomWithNodeProps } from './atomWithNodeProps';
import { atomWithSelection } from './atomWithSelection';
import { atomWithToggle } from './atomWithToggle';
import { NodeEditorView } from './NodeEditorView';
import { useNodeEditor } from './useNodeEditor';
import { root } from './_atoms';

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
      children: [],
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

const rootWithHistory = atomWithHistory<RaisinNode>(initialRoot)
const rootPrimitive = primitiveFromHistory(rootWithHistory);

const selectedAtom = atomWithToggle(false);
const nodeProps = atom({});

export function RootPlayground() {
  return (
    <Provider>
      <RootPlaygroundInner />
    </Provider>
  );
}
function RootPlaygroundInner() {
  const [, setRootNode] = useAtom(root);
  useEffect(() => {
    // Initial state
    setRootNode(initialRoot as RaisinNode);
  }, []);
  const props = useNodeEditor(rootPrimitive, selectedAtom, nodeProps, rootWithHistory);
  const { childAtoms, removeChild } = useChildAtoms(rootPrimitive);
  return (
    <NodeEditorView {...props}>
      {childAtoms.map((childAtom) => {
        return (
          <ChildNodeEditor
            key={`${childAtom}`}
            // Good - from the book
            primitive={childAtom}
            // Good - derived from parent
            selectedAtom={atomWithSelection(childAtom)}
            // Good - derived from parent
            nodeProps={atomWithNodeProps(childAtom)}
            // OK - prop drilling could be smarter
            nodeWithHistory={nodeWithHistory}
            remove={() => removeChild(childAtom)}
          />
        );
      })}
    </NodeEditorView>
  );
}

export function NodePlayground() {
  const props = useNodeEditor(
    primitive,
    selectedAtom,
    nodeProps,
    nodeWithHistory
  );
  const { childAtoms, removeChild } = useChildAtoms(primitive);
  return (
    <NodeEditorView {...props}>
      {childAtoms.map((childAtom) => {
        return (
          <ChildNodeEditor
            key={`${childAtom}`}
            // Good - from the book
            primitive={childAtom}
            // Good - derived from parent
            selectedAtom={atomWithSelection(childAtom)}
            // Good - derived from parent
            nodeProps={atomWithNodeProps(childAtom)}
            // OK - prop drilling could be smarter
            nodeWithHistory={nodeWithHistory}
            remove={() => removeChild(childAtom)}
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
  //   return <div>Child</div>;
  const props = useNodeEditor(
    primitive,
    selectedAtom,
    nodeProps,
    nodeWithHistory
  );
  //   const { childAtom } = useChildAtoms(primitive);
  const [path] = useAtom(atomWithNodePath(primitive));
  return (
    <>
      <NodeEditorView {...props} />
      <div>Path:{JSON.stringify(path)}</div>
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

  return { childAtoms, removeChild };
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
