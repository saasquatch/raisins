import { RaisinElementNode } from '@raisins/core';
import { CssPart, CustomElement } from '@raisins/schema/schema';
import { molecule, useMolecule } from 'bunshi/react';
import { atom, useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import { ComponentModelMolecule } from '../component-metamodel';
import { SelectedNodeMolecule } from '../core/selection/SelectedNodeMolecule';
import { isElementNode } from '../util/isNode';
import { CssEditingMolecule } from './CssEditingMolecule';
import {
  readSection,
  SectionKey,
  selectorOf,
  writeSection,
} from './cssSections';

/**
 * Per-instance CSS editor for the currently selected element. Exposes:
 *
 * - `cssAtom` — read/write the full `data-raisin-css` value as a string
 * - `partsAtom` — the list of `::part(name)` surfaces declared by the
 *   element's component schema
 * - `customPropsAtom` — the list of CSS custom properties declared by the
 *   element's component schema
 *
 * Surface-specific editing (e.g. one rule per part) is left to UI; the
 * molecule deliberately stops at the source-of-truth string so widgets can
 * be composed freely.
 */
export const StyleMolecule = molecule(getMol => {
  const { SelectedNodeAtom } = getMol(SelectedNodeMolecule);
  const { ComponentMetaAtom } = getMol(ComponentModelMolecule);
  const {
    GetInstanceCssAtom,
    SetInstanceCssAtom,
  } = getMol(CssEditingMolecule);

  const selectedElementAtom = atom(get => {
    const node = get(SelectedNodeAtom);
    if (!node || !isElementNode(node)) return undefined;
    return node;
  });

  const componentMetaAtom = atom(get => {
    const node = get(selectedElementAtom);
    if (!node) return undefined;
    return get(ComponentMetaAtom)(node.tagName) as CustomElement;
  });

  const partsAtom = atom<CssPart[]>(
    get => get(componentMetaAtom)?.cssParts ?? []
  );

  const customPropsAtom = atom(get => get(componentMetaAtom)?.cssProperties ?? []);

  const cssAtom = atom(
    get => {
      const node = get(selectedElementAtom);
      if (!node) return '';
      return get(GetInstanceCssAtom)(node);
    },
    (get, set, next: string) => {
      const node = get(selectedElementAtom);
      if (!node) return;
      set(SetInstanceCssAtom, { node, css: next });
    }
  );

  /**
   * Returns the declarations text for a specific editable section
   * (e.g. `:host` or `::part(header)`) of the currently selected element's
   * per-instance CSS.
   */
  const sectionReadAtom = atom(get => {
    const css = get(cssAtom);
    return (section: SectionKey) => readSection(css, section);
  });

  /**
   * Writes new declarations for a single section. Other sections (and any
   * unrecognised rules) in the per-instance CSS are preserved untouched.
   */
  const sectionWriteAtom = atom(
    null,
    (
      get,
      set,
      { section, declarations }: { section: SectionKey; declarations: string }
    ) => {
      const node = get(selectedElementAtom);
      if (!node) return;
      const prev = get(GetInstanceCssAtom)(node);
      const next = writeSection(prev, section, declarations);
      set(SetInstanceCssAtom, { node, css: next });
    }
  );

  return {
    selectedElementAtom,
    componentMetaAtom,
    partsAtom,
    customPropsAtom,
    cssAtom,
    sectionReadAtom,
    sectionWriteAtom,
  };
});

/**
 * Per-instance CSS editor. Renders one editable section for the element
 * itself (`:host`) plus one section per declared `::part(name)`. Each
 * section's textarea contains only declarations — the selector wrapper is
 * applied automatically when the rule is rewritten in `data-raisin-css`.
 *
 * The component schema (`cssParts`, `cssProperties`) is also surfaced so
 * authors can discover what surfaces are stylable on the selected component.
 */
export const StylePanel: React.FC = () => {
  const {
    selectedElementAtom,
    partsAtom,
    customPropsAtom,
    cssAtom,
  } = useMolecule(StyleMolecule);

  const selected = useAtomValue(selectedElementAtom) as
    | RaisinElementNode
    | undefined;
  const parts = useAtomValue(partsAtom);
  const customProps = useAtomValue(customPropsAtom);
  const css = useAtomValue(cssAtom);

  if (!selected) return null;

  return (
    <div>
      <h3>Style: {selected.tagName}</h3>

      <SectionEditor
        key={`element-${selected.tagName}-${selected.attribs['data-raisin-id'] ?? ''}`}
        section={{ type: 'element' }}
        title="Element"
        description={`Applies to the component itself (rendered as :host).`}
      />

      {parts.map(part => (
        <SectionEditor
          key={`part-${part.name}-${selected.attribs['data-raisin-id'] ?? ''}`}
          section={{ type: 'part', name: part.name }}
          title={`::part(${part.name})`}
          description={part.description}
        />
      ))}

      {customProps.length > 0 && (
        <details>
          <summary>CSS custom properties</summary>
          <ul>
            {customProps.map(p => (
              <li key={p.name}>
                <code>{p.name}</code>
                {p.syntax ? ` (${p.syntax})` : ''}
                {p.description ? ` — ${p.description}` : ''}
              </li>
            ))}
          </ul>
        </details>
      )}

      <details>
        <summary>Raw CSS (data-raisin-css)</summary>
        <pre style={{ fontSize: 11, whiteSpace: 'pre-wrap' }}>{css}</pre>
      </details>
    </div>
  );
};

const SectionEditor: React.FC<{
  section: SectionKey;
  title: string;
  description?: string;
}> = ({ section, title, description }) => {
  const { sectionReadAtom, sectionWriteAtom } = useMolecule(StyleMolecule);
  const read = useAtomValue(sectionReadAtom);
  const [, write] = useAtom(sectionWriteAtom);

  // Keep the textarea fully controlled by local state. If we drove `value`
  // from a parse-and-reformat of the stored CSS, every keystroke that produced
  // a momentarily invalid declaration (e.g. mid-token `padding: 1`) would snap
  // the field back to its last-valid form and clobber the caret. Local draft
  // means the user always types into a normal textarea; writes to the atom
  // are best-effort and silently no-op while the input is unparseable.
  const [draft, setDraft] = useState(() => read(section));

  // If the persisted CSS changes from outside (selection change handled by
  // remount key; this covers a programmatic edit on the same element), only
  // overwrite the draft when the field is not focused — never yank text out
  // from under the user mid-keystroke.
  const persisted = read(section);
  useEffect(() => {
    if (document.activeElement?.tagName !== 'TEXTAREA') {
      setDraft(persisted);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persisted]);

  return (
    <div style={SectionStyle}>
      <div style={SectionHeaderStyle}>
        <code>{selectorOf(section)}</code>
        <span style={{ marginLeft: 6, color: '#888' }}>{title}</span>
      </div>
      {description && (
        <div style={{ fontSize: 11, color: '#666' }}>{description}</div>
      )}
      <textarea
        rows={4}
        style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }}
        value={draft}
        placeholder={
          section.type === 'element' ? ELEMENT_PLACEHOLDER : PART_PLACEHOLDER
        }
        onChange={e => {
          const next = (e.target as HTMLTextAreaElement).value;
          setDraft(next);
          write({ section, declarations: next });
        }}
        onBlur={() => write({ section, declarations: draft })}
      />
    </div>
  );
};

const SectionStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  borderRadius: 4,
  padding: 8,
  marginBottom: 8,
};

const SectionHeaderStyle: React.CSSProperties = {
  fontWeight: 600,
  marginBottom: 4,
};

const ELEMENT_PLACEHOLDER = `padding: 16px;\ncolor: #222;`;
const PART_PLACEHOLDER = `background: tomato;\ncolor: white;`;
