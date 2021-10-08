import { RaisinNode } from '@raisins/core';
import { DOMParser, Node } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { EditorState, Selection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import React, { useMemo, useRef, useState } from 'react';
import { proseRichDocToRaisin, raisinToProseDoc } from './Prose2Raisin';

type SerialState = {
  selection?: { [key: string]: any };
  doc: { [key: string]: any };
};

export default function ProseEditor({
  node,
  setNode,
}: {
  node: RaisinNode;
  setNode: React.Dispatch<RaisinNode>;
}) {
  let initialDoc = useMemo(() => raisinToProseDoc(node), [schema]);

  let [sState, setSState] = useState<SerialState>({ doc: initialDoc });

  function dispatchTransaction(trans: Transaction) {
    setSState((current) => {
      const currentState = hydratedState(current);
      const nextState = currentState.applyTransaction(trans);
      const nextDoc = nextState.state.doc.toJSON();
      const nextRaisinNode = proseRichDocToRaisin(nextState.state.doc.content);
      setNode(nextRaisinNode);
      return {
        selection: nextState.state.selection.toJSON(),
        doc: nextDoc,
      };
    });
  }

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

      <hr />
      <pre>{JSON.stringify(sState, null, 2)}</pre>
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
