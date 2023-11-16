import { RaisinDocumentNode } from '@raisins/core';
import { Atom, PrimitiveAtom } from 'jotai';
import { createScope, ScopeProvider } from 'bunshi/react';
import { Schema } from 'prosemirror-model';
import { Plugin, SelectionBookmark } from 'prosemirror-state';
import React from 'react';

export const ProseEditorScope = createScope<ProseEditorScopeType | undefined>(
  undefined
);

export type ProseTextSelection = {
  type: 'text';
  anchor: number;
  head: number;
};

export type ProseEditorScopeProps = {
  /**
   * The raisin node that will be edited
   */
  node: PrimitiveAtom<RaisinDocumentNode>;
  /**
   * The selection inside of the Prose rich text editor
   */
  selection: PrimitiveAtom<SelectionBookmark | undefined>;
  /**
   *
   */
  plugins: Atom<Plugin[]>;
  schema: Atom<Schema>;
};
export type ProseEditorScopeType = Atom<ProseEditorScopeProps>;

export const ProseEditorScopeProvider = (props: {
  value: ProseEditorScopeType;
  children: React.ReactNode;
}) => {
  if (!props.value)
    throw new Error('Must provide value to ProseEditorScopeProvider');
  return (
    <ScopeProvider scope={ProseEditorScope} value={props.value}>
      {props.children}
    </ScopeProvider>
  );
};
