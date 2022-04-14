import { RaisinDocumentNode, RaisinElementNode } from '@raisins/core';
import { ElementType } from 'domelementtype';
import { atom, PrimitiveAtom, SetStateAction } from 'jotai';
import { molecule } from 'jotai-molecules';
import { SoulsMolecule } from '../core/souls/Soul';
import { NodeScopeMolecule } from '../node/NodeScope';
import { createMemoizeAtom } from '../util/weakCache';
import { HistoryKeyMapPluginMolecule } from './HistoryKeyMapPluginAtom';
import { NewLinePlugin } from './prosemirror/plugins/NewLineBreak';
import {
  ProseEditorScopeProps,
  ProseTextSelection,
} from './prosemirror/ProseEditorScope';
import { inlineSchema } from './prosemirror/ProseSchemas';

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
  const selectionAtomAtom = atom<PrimitiveAtom<ProseTextSelection | undefined>>(
    (get) => {
      const node = get(nodeAtom);
      const getSoul = get(GetSoulAtom);
      const soul = getSoul(node);

      const selectionAtom = memoized(
        () => atom<ProseTextSelection | undefined>(undefined),
        [soul]
      );
      return selectionAtom;
    }
  );
  const selection = atom(
    (get) => get(get(selectionAtomAtom)),
    (get, set, next: SetStateAction<ProseTextSelection | undefined>) => {
      set(get(selectionAtomAtom), next);
    }
  );
  const proseAtom = atom<ProseEditorScopeProps>({
    node: docNodeAtom,
    selection,
    plugins: atom((get) => [
      ...get(historyPluginAtoms.PluginsAtom),
      NewLinePlugin(),
    ]),
    schema: atom(inlineSchema),
  });
  return {
    selection,
    docNodeAtom,
    proseAtom,
  };
});
const memoized = createMemoizeAtom();
