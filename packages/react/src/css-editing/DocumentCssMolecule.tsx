import { molecule, useMolecule } from 'bunshi/react';
import { useAtom } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import { CssEditingMolecule } from './CssEditingMolecule';

/**
 * Document-wide CSS editor. Reads and writes the same atom that drives the
 * managed `<style>` block injected into the canvas iframe head.
 */
export const DocumentCssMolecule = molecule(getMol => {
  const { DocumentCssAtom } = getMol(CssEditingMolecule);
  return { DocumentCssAtom };
});

/**
 * Keeps a local draft of the textarea value so the atom's parse/serialize
 * round-trip (which can reformat CSS) doesn't fight the user mid-keystroke.
 * External persisted changes re-sync the draft only while the textarea is
 * unfocused, so typing is never interrupted by a parse/serialize round-trip.
 */
function useDocumentCssEditor() {
  const { DocumentCssAtom } = useMolecule(DocumentCssMolecule);
  const [atomCss, setAtomCss] = useAtom(DocumentCssAtom);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState(() => atomCss);
  const persisted = atomCss;

  // If the persisted CSS changes from outside (selection change handled by
  // remount key; this covers a programmatic edit on the same element), only
  // overwrite the draft when this section's own textarea is not focused —
  // never yank text out from under the user mid-keystroke.
  useEffect(() => {
    if (document.activeElement !== textareaRef.current) {
      setDraft(persisted);
    }
  }, [persisted]);

  const onChange = (next: string) => {
    setDraft(next);
    setAtomCss(next);
  };

  return { textareaRef, value: draft, onChange };
}

// Example component for editing document-wide CSS
export const DocumentCssEditor: React.FC = () => {
  const { textareaRef, value, onChange } = useDocumentCssEditor();
  return (
    <div>
      <h3>Document CSS</h3>
      <textarea
        ref={textareaRef}
        aria-label="Document CSS"
        rows={10}
        style={{ width: '100%', fontFamily: 'monospace' }}
        value={value}
        placeholder={'sqm-hero { display: none; }'}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
};
