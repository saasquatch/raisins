import type { RaisinDocumentNode, RaisinElementNode } from '@raisins/core';
import type { PrimitiveAtom, SetStateAction } from 'jotai';
import { atom } from 'jotai';
import { molecule } from 'bunshi/react';
import { SoulsMolecule } from '../core/souls/Soul.ts';
import { NodeMolecule } from '../node/index.ts';
import { HistoryKeyMapPluginMolecule } from './HistoryKeyMapPluginAtom.ts';
import {
  DefaultProseSchema,
} from './prosemirror/default-schema/DefaultProseSchema.ts';
import {
  DefaultProseSchemaHotkeysPlugin,
} from './prosemirror/default-schema/DefaultProseSchemaHotkeysPlugin.ts';
import type { ProseEditorScopeProps } from './prosemirror/ProseEditorScope.tsx';

export const RichTextMolecule = molecule(getMol => {
  const nodeAtoms = getMol(NodeMolecule);
  const nodeAtom = nodeAtoms.nodeAtom as PrimitiveAtom<RaisinElementNode>;

  const historyPluginAtoms = getMol(HistoryKeyMapPluginMolecule);

  const { SoulSaverAtom } = getMol(SoulsMolecule);

  const docNodeAtom = atom<
    RaisinDocumentNode,
    SetStateAction<RaisinDocumentNode>[],
    void
  >(
    get => {
      return {
        type: 'root',
        children: get(nodeAtom)?.children,
      };
    },
    (get, set, next) => {
      const prevNode = get(nodeAtom);
      const prevDocNode = {
        type: 'root',
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

  const proseAtom = atom<ProseEditorScopeProps>({
    node: docNodeAtom,
    selection: nodeAtoms.bookmarkForNode,
    plugins: atom(get => {
      const HistoryPlugin = get(historyPluginAtoms.HistoryKeyMapPluginAtom);
      if (!HistoryPlugin) {
        return [DefaultProseSchemaHotkeysPlugin];
      }
      return [HistoryPlugin, DefaultProseSchemaHotkeysPlugin];
    }),
    schema: atom(DefaultProseSchema),
  });
  return {
    selection: nodeAtoms.bookmarkForNode,
    docNodeAtom,
    proseAtom,
  };
});
