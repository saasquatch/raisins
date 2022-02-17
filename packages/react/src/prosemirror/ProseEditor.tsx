import { RaisinDocumentNode } from '@raisins/core';
import { Atom, atom, PrimitiveAtom, SetStateAction, useAtom } from 'jotai';
import { DOMParser, Node } from 'prosemirror-model';
import { EditorState, Plugin, Selection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { useMemo } from 'react';
import connectedAtom from '../atoms/connectedAtom';
import { RaisinScope } from '../atoms/RaisinScope';
import { HistoryKeyMapPluginAtom } from '../rich-text/HistoryKeyMapPluginAtom';
import { NewLinePlugin } from './NewLineBreak';
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
  const elementRef = useMemo(() => createAtoms(node, selection), [
    node,
    selection,
  ]);

  const [, mountRef] = useAtom(elementRef, RaisinScope);

  return {
    mountRef,
  };
}

// TODO: pluginAtom as a prop, allow plugins to be hot-swapped
function createAtoms(
  node: PrimitiveAtom<RaisinDocumentNode>,
  selection: PrimitiveAtom<ProseTextSelection | undefined>
) {
  const proseDocAtom = atom((get) => raisinToProseDoc(get(node)));

  // Build editor state

  const editorStateAtom = atom<EditorState | null>((get) => {
    const historyPlugin = get(HistoryKeyMapPluginAtom);
    if (!historyPlugin) return null;
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
  });

  const handleTransactionAtion = atom<null, Transaction>(
    null,
    (get, set, trans) => {
      const currentState = get(editorStateAtom);
      if (!currentState) return;
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
    }
  );

  const elementRef = atom<HTMLElement | null>(null);

  const editorViewAtom: Atom<Atom<EditorView | null>> = atom((get) => {
    const el = get(elementRef);
    if (!el) return atom(null);

    return connectedAtom<EditorView | null>(
      (get, set) => {
        const state = get(editorStateAtom);
        if (!state) return null;

        return new EditorView(el, {
          state,
          dispatchTransaction: (tr) => set(handleTransactionAtion, tr),
          domParser: DOMParser.fromSchema(schema),
          clipboardParser: DOMParser.fromSchema(schema),
        });
      },
      (view) => view && view.destroy()
    );
  });

  return atom(
    (get) => {
      // Subscribes but doesn't listen
      const state = get(editorStateAtom);
      const view = get(get(editorViewAtom));
      if (state) view?.updateState(state);

      return get(elementRef);
    },
    (_, set, next: SetStateAction<HTMLElement | null>) => set(elementRef, next)
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
    // TODO: There's probably a smarter way to validate and replace selections
  }

  let state = EditorState.create({
    doc: richDoc,
    selection: richSelect,
    schema,
    plugins,
  });
  return state;
}
