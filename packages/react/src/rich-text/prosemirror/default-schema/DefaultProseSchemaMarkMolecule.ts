import { DefaultTextMarks } from '@raisins/core';
import { molecule } from 'bunshi/react';
import { atom, WritableAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import type { MarkType } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import React from 'react';
import { ProseEditorStateMolecule } from '../ProseEditorStateMolecule';
import { ProseToggleMarkMolecule } from '../ProseToggleMarkMolecule';
import { DefaultProseSchema } from './DefaultProseSchema';

type ToggleMarkAtom = WritableAtom<
  boolean,
  React.MouseEvent<Element, MouseEvent>[],
  void
>;
type MarkKey = typeof DefaultTextMarks[number];

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
      (_, set, e: React.MouseEvent) => {
        set(toggleMarks.toggleMarkAtom, { e, mark });
      }
    );
  };
  const toggleMarkAtomFamily = atomFamily(toggleMarkAtom);

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

  type ToggleMethodType = `toggle${Capitalize<MarkKey>}`;

  const toggleDefaultMarks = DefaultTextMarks.reduce((atoms, mark) => {
    return {
      ...atoms,
      [`toggle${capitalizeFirst(mark)}`]: toggleMarkAtomFamily(
        DefaultProseSchema.marks[mark]
      ),
    };
  }, {} as Record<ToggleMethodType, ToggleMarkAtom>);

  return {
    ...toggleDefaultMarks,
    toggleBold: toggleMarkAtomFamily(DefaultProseSchema.marks.strong),
    toggleUnderline: toggleMarkAtomFamily(DefaultProseSchema.marks.underline),
    toggleItalic: toggleMarkAtomFamily(DefaultProseSchema.marks.em),
    toggleLink,
  };
});

function markActive(state: EditorState, type: MarkType): boolean {
  const { from, $from, to, empty } = state.selection;
  if (!type) return false;
  if (empty) return !!type.isInSet(state.storedMarks || $from.marks());
  else return state.doc.rangeHasMark(from, to, type);
}

const capitalizeFirst = ([first, ...rest]: string): string => {
  if (!Array.isArray(rest)) return `${first.toUpperCase()}${rest}`;
  return `${first.toUpperCase()}${rest.join('')}`;
};
