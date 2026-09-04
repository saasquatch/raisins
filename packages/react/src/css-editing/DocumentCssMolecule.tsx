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
 * Only re-syncs the draft from the atom when the change came from elsewhere
 * (e.g. undo/redo), not from this hook's own writes.
 */
function useDocumentCssEditor() {
  const { DocumentCssAtom } = useMolecule(DocumentCssMolecule);
  const [atomCss, setAtomCss] = useAtom(DocumentCssAtom);
  const [draft, setDraft] = useState(atomCss);
  const isSelfWrite = useRef(false);

  useEffect(() => {
    if (isSelfWrite.current) {
      isSelfWrite.current = false;
      return;
    }
    setDraft(atomCss);
  }, [atomCss]);

  const onChange = (next: string) => {
    isSelfWrite.current = true;
    setDraft(next);
    setAtomCss(next);
  };

  return { value: draft, onChange };
}

export const DocumentCssEditor: React.FC = () => {
  const { value, onChange } = useDocumentCssEditor();
  return (
    <div>
      <h3>Document CSS</h3>
      <textarea
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
