import { molecule, useMolecule } from 'bunshi/react';
import { useAtom } from 'jotai';
import React from 'react';
import { CssEditingMolecule } from './CssEditingMolecule';

/**
 * Document-wide CSS editor. Reads and writes the same atom that drives the
 * managed `<style>` block injected into the canvas iframe head.
 */
export const DocumentCssMolecule = molecule(getMol => {
  const { DocumentCssAtom } = getMol(CssEditingMolecule);
  return { DocumentCssAtom };
});

export const DocumentCssEditor: React.FC = () => {
  const { DocumentCssAtom } = useMolecule(DocumentCssMolecule);
  const [css, setCss] = useAtom(DocumentCssAtom);
  return (
    <div>
      <h3>Document CSS</h3>
      <textarea
        rows={10}
        style={{ width: '100%', fontFamily: 'monospace' }}
        value={css}
        placeholder={'sqm-hero { display: none; }'}
        onChange={e => setCss(e.target.value)}
      />
    </div>
  );
};
