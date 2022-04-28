import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import type { MarkType } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import React from 'react';
import { ProseEditorStateMolecule } from '../ProseEditorStateMolecule';
import { ProseToggleMarkMolecule } from '../ProseToggleMarkMolecule';
import { DefaultProseSchema } from './DefaultProseSchema';

/**
 * A molecule for making mutations to a {@link ProseEditor} to add
 * the marks or noes from the {@link DefaultSchema}
 */
export const DefaultProseSchemaMarkMolecule = molecule((getMol) => {
  const toggleMarks = getMol(ProseToggleMarkMolecule);
  const stateAtom = getMol(ProseEditorStateMolecule);

  const toggleMarkAtom = (mark: MarkType) => {
    return atom(
      (get) => markActive(get(stateAtom), mark),
      (get, set, e: React.MouseEvent) => {
        set(toggleMarks.toggleMarkAtom, { e, mark });
      }
    );
  };

  const toggleLink = atom(
    (get) => markActive(get(stateAtom), DefaultProseSchema.marks.link),
    (get, set, e: React.MouseEvent) => {
      const hasLink = markActive(get(stateAtom), DefaultProseSchema.marks.link);

      if (!hasLink) {
        const href = window.prompt('What link?');
        if (!href) return;
        // Add mark
        set(toggleMarks.toggleMarkAtom, {
          e,
          mark: DefaultProseSchema.marks.link,
          attrs: { href },
        });
      } else {
        // Remove mark
        set(toggleMarks.toggleMarkAtom, {
          e,
          mark: DefaultProseSchema.marks.link,
        });
      }
    }
  );

  return {
    toggleBold: toggleMarkAtom(DefaultProseSchema.marks.strong),
    toggleUnderline: toggleMarkAtom(DefaultProseSchema.marks.underline),
    toggleItalic: toggleMarkAtom(DefaultProseSchema.marks.em),
    toggleLink,
  };
});

function markActive(state: EditorState, type: MarkType) {
  let { from, $from, to, empty } = state.selection;
  if (empty) return type.isInSet(state.storedMarks || $from.marks());
  else return state.doc.rangeHasMark(from, to, type);
}
