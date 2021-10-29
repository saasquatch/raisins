import { RaisinDocumentNode, RaisinNode } from '@raisins/core';
import { atom, PrimitiveAtom, useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { DOMParser, Node } from 'prosemirror-model';
import { EditorState, Plugin, Selection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import React, { SetStateAction, useMemo, useRef, useState } from 'react';
import { NewLinePlugin } from './NewLineBreak';
import { proseRichDocToRaisin, raisinToProseDoc } from './Prose2Raisin';
import { inlineSchema as schema } from './ProseSchemas';
import { useRaisinHistoryPlugin } from '../rich-text/useRaisinHistoryPlugin';

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

  const historyPlugin = useRaisinHistoryPlugin();

  const editorStateAtom = useMemo(
    () =>
      atom<EditorState>((get) => {
        const sState: SerialState = {
          doc: get(proseDocAtom),
          selection: get(selection),
        };
        return hydratedState(sState, [
          //
          NewLinePlugin(),
          //
          historyPlugin,
        ]);
      }),
    [proseDocAtom, selection, historyPlugin]
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

function hydratedState(
  sState: SerialState,
  plugins: Plugin[] = []
): EditorState {
  const { doc, selection } = sState;
  const richDoc = Node.fromJSON(schema, doc);
  let richSelect: Selection | undefined = undefined;
  try {
    richSelect = selection ? Selection.fromJSON(richDoc, selection) : undefined;
  } catch (e) {
    // Selection out of range caught here
    // TODO: There's probably a smarter way to validate and replace selections.
  }

  let state = EditorState.create({
    doc: richDoc,
    selection: richSelect,
    schema,
    plugins,
  });
  return state;
}
