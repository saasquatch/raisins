import { useMolecule } from 'jotai-molecules';
import React from 'react';
import { ProseEditor } from './prosemirror/ProseEditor';
import { ProseEditorScopeProvider } from './prosemirror/ProseEditorScope';
import { RichTextMolecule } from './RichTextMolecule';

/**
 * A controller for editing the {@link NodeScopeMolecule} as rich text via a Prose Editor
 *
 * @returns
 */
export function NodeRichTextController() {
  const { proseAtom } = useMolecule(RichTextMolecule);

  return (
    <ProseEditorScopeProvider value={proseAtom}>
      <ProseEditor />
    </ProseEditorScopeProvider>
  );
}
