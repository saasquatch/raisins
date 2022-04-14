import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { Node } from 'prosemirror-model';
import { EditorState, Selection, Transaction } from 'prosemirror-state';
import { ProseEditorScope, ProseTextSelection } from './ProseEditorScope';
import { proseRichDocToRaisin, raisinToProseDoc } from './util/Prose2Raisin';

/**
 * Molecule wrapper for ProseMirror {@link EditorState} that adapts {@link RaisinNode} to
 * the prosemirror document format
 */
export const ProseEditorStateMolecule = molecule((_, getScope) => {
  const scope = getScope(ProseEditorScope);
  if (!scope)
    throw new Error(
      'ProseEditorStateMolecule must be used in a ProseEditorProvider'
    );

  const proseDocAtom = atom((get) => raisinToProseDoc(get(get(scope).node)));
  const proseNodeAtom = atom((get) => {
    const schema = get(get(scope).schema);
    const doc = get(proseDocAtom);
    const richDoc = Node.fromJSON(schema, doc);
    return richDoc;
  });
  const proseSelectionAtom = atom((get) => {
    const doc = get(proseNodeAtom);
    const selection = get(get(scope).selection);
    let richSelect: Selection | undefined = undefined;
    try {
      richSelect = selection ? Selection.fromJSON(doc, selection) : undefined;
    } catch (e) {
      // Selection out of range caught here
      // TODO: There's probably a smarter way to validate and replace selections
      // Read: https://github.com/ProseMirror/prosemirror-history/blob/master/src/history.js
    }
    return richSelect;
  });

  // Build editor state
  const editorStateAtom = atom<EditorState, Transaction>(
    (get) => {
      let state = EditorState.create({
        doc: get(proseNodeAtom),
        selection: get(proseSelectionAtom),
        schema: get(get(scope).schema),
        plugins: get(get(scope).plugins),
      });
      return state;
    },
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
        set(get(scope).selection, neextSelection);
      }
      if (nextState.state.doc !== currentState.doc) {
        // Only lazily serializes changes
        const nextRaisinNode = proseRichDocToRaisin(
          nextState.state.doc.content
        );
        set(get(scope).node, nextRaisinNode);
      }
    }
  );

  return editorStateAtom;
});
