import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { Node } from 'prosemirror-model';
import { EditorState, SelectionBookmark, Transaction } from 'prosemirror-state';
import { ProseEditorScope } from './ProseEditorScope';
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
    const bookmark: SelectionBookmark | undefined = get(get(scope).selection);
    if (!bookmark) return undefined;
    console.log('Resolve bookmark', bookmark);
    return bookmark.resolve(doc);
  });

  // Build editor state
  const editorStateAtom = atom<EditorState, Transaction>(
    (get) => {
      console.log(
        'Changed prose state',
        get(proseNodeAtom),
        get(proseSelectionAtom)
      );
      let state = EditorState.create({
        doc: get(proseNodeAtom),
        selection: get(proseSelectionAtom),
        schema: get(get(scope).schema),
        plugins: get(get(scope).plugins),
      });
      return state;
    },
    (get, set, trans) => {
      const currentState = get(editorStateAtom) as EditorState;
      if (!currentState) return;
      const nextState = currentState.applyTransaction(trans);

      if (nextState.state.doc !== currentState.doc) {
        // Only lazily serializes changes
        const nextRaisinNode = proseRichDocToRaisin(
          nextState.state.doc.content
        );
        set(get(scope).node, nextRaisinNode);
      }
      // IMPORTANT: This currently works ONLY if selection is updated AFTER document.
      // Otherwise typing at the end of a text area will throw an error.
      // e.g. "Position 51 out of range"
      if (nextState.state.selection !== currentState.selection) {
        // Only lazily serializes changes
        const nextSelection = nextState.state.selection.getBookmark();
        set(get(scope).selection, nextSelection);
      }
    }
  );

  return editorStateAtom;
});
