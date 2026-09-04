import {
  cssParser,
  cssSerializer,
  htmlUtil,
  RaisinElementNode,
  RaisinNode,
  RaisinNodeWithChildren,
  RaisinStyleNode,
  scopeStylesheet,
} from '@raisins/core';
import { molecule } from 'bunshi/react';
import { atom, Atom, WritableAtom } from 'jotai';
import { CoreMolecule } from '../core/CoreAtoms';
import { EditMolecule } from '../core/editting/EditAtoms';
import {
  generateId,
  RAISIN_CSS_ATTR,
  RAISIN_DOCUMENT_CSS_ATTR,
  RAISIN_ID_ATTR,
} from './RaisinCssIds';
import { RaisinIdsMolecule } from './RaisinIdsMolecule';

/**
 * HTML attributes used by Raisins to mark elements that participate in
 * per-instance CSS editing.
 */
export { RAISIN_CSS_ATTR, RAISIN_ID_ATTR } from './RaisinCssIds';

const { visit } = htmlUtil;


function isElement(n: RaisinNode): n is RaisinElementNode {
  return n.type === 'tag';
}

/**
 * Finds the `<style>` node holding document-wide CSS, identified by
 * {@link RAISIN_DOCUMENT_CSS_ATTR}.
 */
function findDocumentCssNode(root: RaisinNode): RaisinStyleNode | undefined {
  let found: RaisinStyleNode | undefined;
  visit<undefined>(root, {
    onStyle(style) {
      if (style.attribs[RAISIN_DOCUMENT_CSS_ATTR]) {
        found = style;
      }
      return undefined;
    },
    onElement(_) {
      return undefined;
    },
    onRoot(_, __) {
      return undefined;
    },
  });
  return found;
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
   * Page-wide CSS authored in the Document CSS editor. Backed by a `<style>`
   * node (marked with `data-raisin-document-css`) inside `RootNodeAtom`, so
   * it round-trips through `HTMLAtom` and participates in undo/redo like any
   * other document edit. Reads "" and omits the node while empty.
   */
  DocumentCssAtom: WritableAtom<string, [string], void>;

  /**
   * The full CSS the canvas should render: page-wide CSS followed by all
   * per-instance CSS, each scoped to the relevant `data-raisin-id`. The
   * `<style data-raisin-document-css>` node itself is suppressed from canvas
   * rendering (see `raisinToSnabdom`) so it isn't applied twice.
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
    [{ node: RaisinElementNode; css: string }],
    void
  >;
};

export const CssEditingMolecule = molecule(
  (getMol): CssEditingMoleculeType => {
    const { RootNodeAtom } = getMol(CoreMolecule);
    const { ReplaceNodeAtom, InsertNodeAtom, RemoveNodeAtom } = getMol(
      EditMolecule
    );
    const { UsedRaisinIdsAtom } = getMol(RaisinIdsMolecule);

    const DocumentCssAtom = atom(
      get => {
        const node = findDocumentCssNode(get(RootNodeAtom));
        if (!node?.contents) return '';
        try {
          return cssSerializer(node.contents);
        } catch {
          return '';
        }
      },
      (get, set, next: string) => {
        const root = get(RootNodeAtom);
        const existing = findDocumentCssNode(root);

        if (next.length === 0) {
          if (existing) set(RemoveNodeAtom, existing);
          return;
        }

        let contents;
        try {
          contents = cssParser(next);
        } catch {
          return;
        }

        if (existing) {
          set(ReplaceNodeAtom, {
            prev: existing,
            next: { ...existing, contents },
          });
        } else {
          const styleNode: RaisinStyleNode = {
            type: 'style',
            tagName: 'style',
            attribs: { [RAISIN_DOCUMENT_CSS_ATTR]: 'true' },
            contents,
          };
          set(InsertNodeAtom, {
            node: styleNode,
            parent: root as RaisinNodeWithChildren,
            idx: 0,
          });
        }
      }
    );
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
      (get, set, { node, css }: { node: RaisinElementNode; css: string }) => {
        const nextAttribs = { ...node.attribs };
        if (css.length === 0) {
          delete nextAttribs[RAISIN_CSS_ATTR];
        } else {
          nextAttribs[RAISIN_CSS_ATTR] = css;
          if (!nextAttribs[RAISIN_ID_ATTR]) {
            let id = generateId();
            const existingIds = get(UsedRaisinIdsAtom);
            while (existingIds.has(id)) {
              id = generateId();
            }
            nextAttribs[RAISIN_ID_ATTR] = id;
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
