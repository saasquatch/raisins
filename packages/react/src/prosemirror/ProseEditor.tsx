import { RaisinDocumentNode, RaisinNode } from '@raisins/core';
import { atom, PrimitiveAtom, useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { DOMParser, Node } from 'prosemirror-model';
import { EditorState, Selection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import React, { SetStateAction, useMemo, useRef, useState } from 'react';
import { proseRichDocToRaisin, raisinToProseDoc } from './Prose2Raisin';
import { inlineSchema as schema } from './ProseSchemas';

type SerialState = {
  selection?: ProseTextSelection;
  doc: { [key: string]: any };
};

export type ProseTextSelection = {
  type: 'text';
  anchor: number;
  head: number;
};

export type RaisinProseState = {
  node: RaisinDocumentNode;
  selection?: ProseTextSelection;
};

type ProseEditorProps = {
  state: RaisinProseState;
  setState: React.Dispatch<SetStateAction<RaisinProseState>>;
};
export default ControlledProseEditor;

/**
 * A [Controlled Component](https://reactjs.org/docs/forms.html#controlled-components) for
 * doing rich text editing. Uses external state (no internal state)
 *
 * @param props
 * @returns
 */
export function ControlledProseEditor(props: ProseEditorProps) {
  return <ProseEditorView {...useExternalState(props.state, props.setState)} />;
}

export function AtomProseEditor(props: {
  nodeAtom: PrimitiveAtom<RaisinDocumentNode>;
  selectionAtom: PrimitiveAtom<ProseTextSelection | undefined>;
}) {
  return (
    <ProseEditorView2
      {...useProseEditorOnAtom(props.nodeAtom, props.selectionAtom)}
    />
  );
}

/**
 * An [Uncontrolled Component](https://reactjs.org/docs/uncontrolled-components.html) for
 * doing rich text editing. Doesn't send state back in `setState`
 */
export function UncontrollerProseEditor({ state, setState }: ProseEditorProps) {
  const { sState, dispatchTransaction } = useInternalState(state.node);
  return (
    <>
      <ProseEditorView
        sState={sState}
        dispatchTransaction={dispatchTransaction}
      />
    </>
  );
}

/**
 * A prose editor that stores it's state in the `node` and `selection` atoms that are provided to this hook.
 *
 * @param node
 * @param selection
 * @returns
 */
export function useProseEditorOnAtom(
  node: PrimitiveAtom<RaisinDocumentNode>,
  selection: PrimitiveAtom<ProseTextSelection | undefined>
) {
  // Memoize derived parsed doc
  const proseDocAtom = useMemo(
    () => atom((get) => raisinToProseDoc(get(node))),
    [node]
  );

  // Build editor state
  const editorStateAtom = useMemo(
    () =>
      atom<EditorState>((get) => {
        const sState: SerialState = {
          doc: get(proseDocAtom),
          selection: get(selection),
        };
        return hydratedState(sState);
      }),
    [proseDocAtom, selection]
  );
  const handleTransactionAtion = useMemo(
    () =>
      atom<null, Transaction>(null, (get, set, trans) => {
        const currentState = get(editorStateAtom);
        const nextState = currentState.applyTransaction(trans);

        // FIXME: Re-bundle this state. Since node and selection are independently updated,
        // their derived state can become inconsistent.
        // e.g. derived state fo `hydrateState` throw an error such as "Position 51 out of range"
        // NOTE: This currently works ONLY if selection is updated BEFORE document.
        // Otherwise deleting from the end of the text will throw an error
        if (nextState.state.selection !== currentState.selection) {
          // Only lazily serializes changes
          const neextSelection = nextState.state.selection.toJSON() as ProseTextSelection;
          set(selection, neextSelection);
        }
        if (nextState.state.doc !== currentState.doc) {
          // Only lazily serializes changes
          const nextRaisinNode = proseRichDocToRaisin(
            nextState.state.doc.content
          );
          set(node, nextRaisinNode);
        }
      }),
    [editorStateAtom, node, selection]
  );

  const elementRef = useRefAtom();

  const mountRef = useUpdateAtom(elementRef);
  const dispatchTransaction = useUpdateAtom(handleTransactionAtion);
  const editorState = useAtomValue(editorStateAtom);

  const editorAtom = useRef(
    atom((get) => {
      const el = get(elementRef);
      if (el) {
        return new EditorView(el, {
          state: editorState,
          dispatchTransaction,
          domParser: DOMParser.fromSchema(schema),
          clipboardParser: DOMParser.fromSchema(schema),
        });
      }
      return;
    })
  );

  const [editor] = useAtom(editorAtom.current);
  editor?.updateState(editorState);
  return {
    mountRef,
  };
}

/**
 * Like a useRef, but allows for derived memoized state thanks to Jotai
 */
function useRefAtom() {
  const ref = useRef(atom<HTMLElement | null>(null));
  return ref.current;
}

function useExternalState(
  state: RaisinProseState,
  setState: React.Dispatch<SetStateAction<RaisinProseState>>
) {
  // TODO: Measure and optimize the HTML conversion step here.
  let doc = raisinToProseDoc(state.node);
  let selection = state.selection;
  let sState = {
    doc,
    selection,
  };

  function dispatchTransaction(trans: Transaction) {
    try {
      setState((current: RaisinProseState) => {
        const sState = {
          // TODO: Measure and optimize the HTML conversion step here.
          doc: raisinToProseDoc(current.node),
          selection: current.selection,
        };
        const currentState = hydratedState(sState);
        const nextState = currentState.applyTransaction(trans);
        // TODO: Measure and optimize the HTML conversion step here.
        const nextRaisinNode = proseRichDocToRaisin(
          nextState.state.doc.content
        );
        const next: RaisinProseState = {
          selection: nextState.state.selection.toJSON() as ProseTextSelection,
          node: nextRaisinNode,
        };
        return next;
      });
    } catch (e) {
      console.error('Error dispatching transaction from Prose to React', e);
    }
  }
  return { sState, dispatchTransaction };
}

function useInternalState(node: RaisinNode) {
  let initialDoc = useMemo(() => raisinToProseDoc(node), [schema]);
  let [sState, setSState] = useState<SerialState>({ doc: initialDoc });
  function dispatchTransaction(trans: Transaction) {
    setSState((current) => {
      const currentState = hydratedState(current);
      const nextState = currentState.applyTransaction(trans);
      const nextDoc = nextState.state.doc.toJSON();
      const nextRaisinNode = proseRichDocToRaisin(nextState.state.doc.content);
      // setNode(nextRaisinNode);
      return {
        selection: nextState.state.selection.toJSON() as ProseTextSelection,
        doc: nextDoc,
      };
    });
  }

  return { sState, dispatchTransaction };
}

function ProseEditorView2({
  mountRef,
}: {
  mountRef: (el: HTMLElement | null) => void;
}) {
  return (
    <>
      <div ref={mountRef} />
    </>
  );
}

function ProseEditorView({
  sState,
  dispatchTransaction,
}: {
  sState: SerialState;
  dispatchTransaction: (trans: Transaction) => void;
}) {
  const viewRef = useRef<EditorView>();
  function mountRef(el: HTMLDivElement) {
    const make = () =>
      new EditorView(el, {
        state: hydratedState(sState),
        dispatchTransaction,
        domParser: DOMParser.fromSchema(schema),
        clipboardParser: DOMParser.fromSchema(schema),
      });

    if (!viewRef.current && el) {
      viewRef.current = make();
    }
  }

  const state = hydratedState(sState);
  viewRef.current?.updateState(state);

  return (
    <>
      <div ref={mountRef} />
    </>
  );
}

function hydratedState(sState: SerialState): EditorState {
  const { doc, selection } = sState;
  const richDoc = Node.fromJSON(schema, doc);
  const richSelect = selection
    ? Selection.fromJSON(richDoc, selection)
    : undefined;

  let state = EditorState.create({
    doc: richDoc,
    selection: richSelect,
    schema,
  });
  return state;
}

/**
 * Use this to set up local selection state in a React component;
 *
 * @returns a selection state atom
 */
export function useSelectionAtom() {
  return useRef<PrimitiveAtom<ProseTextSelection | undefined>>(
    atom(undefined) as any
  ).current;
}
