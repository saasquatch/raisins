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
  RAISIN_MANAGED_CSS_ATTR,
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
function findStyleNode(
  root: RaisinNode,
  marker: string
): RaisinStyleNode | undefined {
  let found: RaisinStyleNode | undefined;
  visit<undefined>(root, {
    onStyle(style) {
      if (style.attribs[marker]) found = style;
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
      if (
        typeof css === 'string' &&
        css.length > 0 &&
        typeof id === 'string' &&
        id.length > 0
      ) {
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
   * persisted style nodes themselves are suppressed from canvas rendering (see
   * `raisinToSnabdom`) so they aren't applied twice.
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

  /**
   * Writes the raisin-managed style sheet to the document. This includes all
   * per-instance CSS and the document-wide CSS.
   */
  PersistStyleSheetAtom: WritableAtom<null, [], void>;
};

export const CssEditingMolecule = molecule(
  (getMol): CssEditingMoleculeType => {
    const { RootNodeAtom } = getMol(CoreMolecule);
    const { ReplaceNodeAtom, InsertNodeAtom, RemoveNodeAtom } = getMol(
      EditMolecule
    );
    const { UsedRaisinIdsAtom } = getMol(RaisinIdsMolecule);

    // Scoped CSS keyed by id + source css. Replaced wholesale on each pass so
    // it can't outgrow the number of styled elements.
    let scopedCssCache = new Map<string, string>();

    const DocumentCssAtom = atom(
      get => {
        const node = findStyleNode(get(RootNodeAtom), RAISIN_DOCUMENT_CSS_ATTR);
        if (!node?.contents) return '';
        try {
          return cssSerializer(node.contents);
        } catch {
          return '';
        }
      },
      (get, set, next: string) => {
        const root = get(RootNodeAtom);
        const existing = findStyleNode(root, RAISIN_DOCUMENT_CSS_ATTR);

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
            idx: (root as RaisinNodeWithChildren).children.length,
          });
        }
      }
    );
    DocumentCssAtom.debugLabel = 'DocumentCssAtom';

    const InstanceStyleSheetAtom = atom(get => {
      const root = get(RootNodeAtom);
      const instances = collectElementsWithInstanceCss(root);

      // Every document edit recomputes this, so re-scoping the untouched
      // elements would make each keystroke cost O(all styled elements).
      const nextCache = new Map<string, string>();
      const scopedParts = instances
        .map(({ id, css }) => {
          const key = `${id}\u0000${css}`;
          const cached = scopedCssCache.get(key);
          if (cached !== undefined) {
            nextCache.set(key, cached);
            return cached;
          }
          let scoped: string;
          try {
            scoped = cssSerializer(scopeStylesheet(cssParser(css), id));
          } catch {
            scoped = '';
          }
          nextCache.set(key, scoped);
          return scoped;
        })
        .filter(part => part.length > 0);
      scopedCssCache = nextCache;

      return scopedParts.join('\n');
    });

    const ManagedStyleSheetAtom = atom(get => {
      const documentCss = get(DocumentCssAtom);
      const instanceCss = get(InstanceStyleSheetAtom);

      return [documentCss, instanceCss].filter(s => s.length > 0).join('\n');
    });
    ManagedStyleSheetAtom.debugLabel = 'ManagedStyleSheetAtom';

    const PersistStyleSheetAtom = atom(null, (get, set) => {
      const root = get(RootNodeAtom);
      const raisinsManagedStyle = get(InstanceStyleSheetAtom);
      const existing = findStyleNode(root, RAISIN_MANAGED_CSS_ATTR);

      if (raisinsManagedStyle.length === 0) {
        if (existing) set(RemoveNodeAtom, existing);
        return;
      }

      let contents;
      try {
        contents = cssParser(raisinsManagedStyle);
      } catch {
        return;
      }

      if (existing) {
        set(ReplaceNodeAtom, {
          prev: existing,
          next: { ...existing, contents },
        });
        return;
      }

      const styleNode: RaisinStyleNode = {
        type: 'style',
        tagName: 'style',
        attribs: { [RAISIN_MANAGED_CSS_ATTR]: 'true' },
        contents,
      };
      set(InsertNodeAtom, {
        node: styleNode,
        parent: root as RaisinNodeWithChildren,
        idx: (root as RaisinNodeWithChildren).children.length,
      });
    });
    PersistStyleSheetAtom.debugLabel = 'PersistStyleSheetAtom';

    const GetInstanceCssAtom = atom(() => {
      return (node: RaisinElementNode): string => {
        if (!isElement(node)) return '';
        return node.attribs[RAISIN_CSS_ATTR] ?? '';
      };
    });

    const SetInstanceCssAtom = atom(
      null,
      (get, set, { node, css }: { node: RaisinElementNode; css: string }) => {
        // Every write re-serializes the whole document and re-renders the
        // canvas, so a write that changes nothing is never worth doing.
        const current = node.attribs[RAISIN_CSS_ATTR];
        const unchanged =
          css.length === 0
            ? current === undefined
            : current === css && Boolean(node.attribs[RAISIN_ID_ATTR]);
        if (unchanged) return;

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
      PersistStyleSheetAtom,
    };
  }
);
