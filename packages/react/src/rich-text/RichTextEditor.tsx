import { useMolecule } from "bunshi/react";
import React from "react";
import { ProseEditor } from "./prosemirror/ProseEditor.tsx";
import { ProseEditorScopeProvider } from "./prosemirror/ProseEditorScope.tsx";
import { RichTextMolecule } from "./RichTextMolecule.tsx";

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
