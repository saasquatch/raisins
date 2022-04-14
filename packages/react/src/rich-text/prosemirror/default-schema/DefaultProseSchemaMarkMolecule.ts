import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import type { MarkType } from 'prosemirror-model';
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
    return atom((get)=>{
      const state = get(stateAtom);

      state.selection.$from.marks
    }, (get, set, e: React.MouseEvent) => {
      set(toggleMarks.toggleMarkAtom, { e, mark });
    });
  };

  return {
    toggleBold: toggleMarkAtom(DefaultProseSchema.marks.strong),
    toggleUnderline: toggleMarkAtom(DefaultProseSchema.marks.underline),
    toggleItalic: toggleMarkAtom(DefaultProseSchema.marks.em),
  };
});
