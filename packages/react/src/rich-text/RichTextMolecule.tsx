import { RaisinDocumentNode, RaisinElementNode } from '@raisins/core';
import { ElementType } from 'domelementtype';
import { atom, PrimitiveAtom, SetStateAction } from 'jotai';
import { molecule } from 'jotai-molecules';
import { SelectionBookmark } from 'prosemirror-state';
import { SoulsMolecule } from '../core/souls/Soul';
import { NodeScopeMolecule } from '../node/NodeScope';
import { createMemoizeAtom } from '../util/weakCache';
import { HistoryKeyMapPluginMolecule } from './HistoryKeyMapPluginAtom';
import { DefaultProseSchema } from './prosemirror/default-schema/DefaultProseSchema';
import { DefaultProseSchemaHotkeysPlugin } from './prosemirror/default-schema/DefaultProseSchemaHotkeysPlugin';
import { ProseEditorScopeProps } from './prosemirror/ProseEditorScope';

export const RichTextMolecule = molecule((getMol) => {
  const nodeAtom = getMol(
    NodeScopeMolecule
  ) as PrimitiveAtom<RaisinElementNode>;

  const historyPluginAtoms = getMol(HistoryKeyMapPluginMolecule);

  const { GetSoulAtom, SoulSaverAtom } = getMol(SoulsMolecule);

  const docNodeAtom = atom<
    RaisinDocumentNode,
    SetStateAction<RaisinDocumentNode>
  >(
    (get) => {
      return {
        type: ElementType.Root,
        children: get(nodeAtom).children,
      };
    },
    (get, set, next) => {
      const prevNode = get(nodeAtom);
      const prevDocNode = {
        type: ElementType.Root,
        children: prevNode.children,
      } as RaisinDocumentNode;
      const nextVal = typeof next === 'function' ? next(prevDocNode) : next;
      const nextNode = {
        ...prevNode,
        children: nextVal.children,
      };
      const soulSaver = get(SoulSaverAtom);
      set(nodeAtom, soulSaver(prevNode, nextNode) as RaisinElementNode);
    }
  );
  const selectionAtomAtom = atom<PrimitiveAtom<SelectionBookmark | undefined>>(
    (get) => {
      const node = get(nodeAtom);
      const getSoul = get(GetSoulAtom);
      const soul = getSoul(node);

      // TODO: Move the selection state up to the global SelectionAtom
      // and then steal the cursor move undo logic from prose history https://github.com/ProseMirror/prosemirror-history/blob/master/src/history.js
      // NOTE: Fixing this will fix the problem where after you undo a character, it goes backwards
      const selectionAtom = memoized(
        () => atom<SelectionBookmark | undefined>(undefined),
        [soul]
      );
      return selectionAtom;
    }
  );
  const selection = atom(
    (get) => get(get(selectionAtomAtom)),
    (get, set, next: SetStateAction<SelectionBookmark | undefined>) => {
      set(get(selectionAtomAtom), next);
    }
  );
  const proseAtom = atom<ProseEditorScopeProps>({
    node: docNodeAtom,
    selection,
    plugins: atom((get) => {
      const HistoryPlugin = get(historyPluginAtoms.HistoryKeyMapPluginAtom);
      if (!HistoryPlugin) {
        return [DefaultProseSchemaHotkeysPlugin];
      }
      return [HistoryPlugin, DefaultProseSchemaHotkeysPlugin];
    }),
    schema: atom(DefaultProseSchema),
  });
  return {
    selection,
    docNodeAtom,
    proseAtom,
  };
});
const memoized = createMemoizeAtom();
