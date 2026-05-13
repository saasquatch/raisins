import {
  cssParser,
  cssSerializer,
  htmlUtil,
  RaisinElementNode,
  RaisinNode,
  scopeStylesheet,
} from '@raisins/core';
import { molecule } from 'bunshi/react';
import { atom, Atom, PrimitiveAtom, WritableAtom } from 'jotai';
import { CoreMolecule } from '../core/CoreAtoms';
import { EditMolecule } from '../core/editting/EditAtoms';

/**
 * HTML attributes used by Raisins to mark elements that participate in
 * per-instance CSS editing.
 */
export const RAISIN_CSS_ATTR = 'data-raisin-css';
export const RAISIN_ID_ATTR = 'data-raisin-id';

const { visit } = htmlUtil;

/**
 * Generates a short, stable-ish id for new `data-raisin-id` attributes. Not
 * required to be cryptographically random — just unique enough that two
 * elements on the same page do not collide.
 */
function generateId(): string {
  return 'r' + Math.random().toString(36).slice(2, 10);
}

function isElement(n: RaisinNode): n is RaisinElementNode {
  return n.type === 'tag';
}

function collectElementsWithInstanceCss(
  root: RaisinNode
): Array<{ id: string; css: string }> {
  const collected: Array<{ id: string; css: string }> = [];
  visit(root, {
    onElement(el) {
      const css = el.attribs[RAISIN_CSS_ATTR];
      const id = el.attribs[RAISIN_ID_ATTR];
      if (typeof css === 'string' && css.length > 0 && typeof id === 'string') {
        collected.push({ id, css });
      }
      return el;
    },
    onRoot(_, __) {
      return undefined;
    },
  });
  return collected;
}

export type CssEditingMoleculeType = {
  /**
   * Page-wide CSS authored in the Document CSS editor. Persisted in the host
   * application by whatever state plumbs `RootNodeAtom` — see
   * {@link CssEditingMolecule} docs for the v1 trade-off.
   */
  DocumentCssAtom: PrimitiveAtom<string>;

  /**
   * The full CSS the canvas should render: page-wide CSS followed by all
   * per-instance CSS, each scoped to the relevant `data-raisin-id`.
   */
  ManagedStyleSheetAtom: Atom<string>;

  /**
   * Reads the per-instance CSS for an element, falling back to "".
   */
  GetInstanceCssAtom: Atom<(node: RaisinElementNode) => string>;

  /**
   * Writes `data-raisin-css` (and assigns `data-raisin-id` if missing) for an
   * element on the document tree. Pass `""` to clear.
   */
  SetInstanceCssAtom: WritableAtom<
    null,
    { node: RaisinElementNode; css: string },
    void
  >;
};

export const CssEditingMolecule = molecule(
  (getMol): CssEditingMoleculeType => {
    const { RootNodeAtom } = getMol(CoreMolecule);
    const { ReplaceNodeAtom } = getMol(EditMolecule);

    const DocumentCssAtom = atom<string>('');
    DocumentCssAtom.debugLabel = 'DocumentCssAtom';

    const ManagedStyleSheetAtom = atom(get => {
      const root = get(RootNodeAtom);
      const documentCss = get(DocumentCssAtom);
      const instances = collectElementsWithInstanceCss(root);

      const scopedParts = instances
        .map(({ id, css }) => {
          try {
            return cssSerializer(scopeStylesheet(cssParser(css), id));
          } catch {
            return '';
          }
        })
        .filter(part => part.length > 0);

      return [documentCss, ...scopedParts].filter(s => s.length > 0).join('\n');
    });
    ManagedStyleSheetAtom.debugLabel = 'ManagedStyleSheetAtom';

    const GetInstanceCssAtom = atom(() => {
      return (node: RaisinElementNode): string => {
        if (!isElement(node)) return '';
        return node.attribs[RAISIN_CSS_ATTR] ?? '';
      };
    });

    const SetInstanceCssAtom = atom(
      null,
      (_get, set, { node, css }: { node: RaisinElementNode; css: string }) => {
        const nextAttribs = { ...node.attribs };
        if (css.length === 0) {
          delete nextAttribs[RAISIN_CSS_ATTR];
        } else {
          nextAttribs[RAISIN_CSS_ATTR] = css;
          if (!nextAttribs[RAISIN_ID_ATTR]) {
            nextAttribs[RAISIN_ID_ATTR] = generateId();
          }
        }
        const nextNode: RaisinElementNode = { ...node, attribs: nextAttribs };
        set(ReplaceNodeAtom, { prev: node, next: nextNode });
      }
    );

    return {
      DocumentCssAtom,
      ManagedStyleSheetAtom,
      GetInstanceCssAtom,
      SetInstanceCssAtom,
    };
  }
);
