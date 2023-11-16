import { Atom, atom, SetStateAction } from 'jotai';
import { createScope, molecule } from 'bunshi/react';
import { EditorView } from 'prosemirror-view';
import connectedAtom from '../../util/atoms/connectedAtom';
import { ProseEditorStateMolecule } from './ProseEditorStateMolecule';

/**
 * Wraps a ProseMirror {@link EditorView} in a way that works with atomic state in jotai
 *
 * Mostly it relies on an upstream {@link EditorState}
 */
export const ProseEditorViewMolecule = molecule((getMol, getScope) => {
  // Subscribes to view scope, so will create a new view molecule for each view
  getScope(ProseEditorViewScope);

  const editorStateAtom = getMol(ProseEditorStateMolecule);
  const elementRef = atom<HTMLElement | null>(null);

  /**
   * For every element value, creates a new {@link Atom} for holding the editor view state
   */
  const viewAtom: Atom<Atom<EditorView | null>> = atom((get) => {
    const el = get(elementRef);
    if (!el) return atom(null);
    return connectedAtom<EditorView | null>(
      (get, set) => {
        const state = get(editorStateAtom);
        if (!state) return null;

        return new EditorView(el, {
          state,
          dispatchTransaction: (tr) => set(editorStateAtom, tr),
        });
      },
      (view) => view && view.destroy()
    );
  });

  const elementAtom = atom(
    (get) => {
      const state = get(editorStateAtom);
      const view = get(get(viewAtom));
      /**
       * Whenever the {@link state} or {@link view} changes
       * then this will trigger a re-render in ProseMirror.
       *
       * See: https://prosemirror.net/docs/guide/
       */
      if (state) view?.updateState(state);

      return get(elementRef);
    },
    (_, set, next: SetStateAction<HTMLElement | null>) => {
      set(elementRef, next);
    }
  );
  return {
    viewAtom,
    elementAtom,
  };
});

/**
 * a unique scope for creating molecule-per-component state
 */
export const ProseEditorViewScope = createScope<unknown>(undefined);
