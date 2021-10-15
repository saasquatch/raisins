import { NodePath, RaisinDocumentNode, RaisinNode } from '@raisins/core';
import { atom } from 'jotai';
import { ElementType } from 'domelementtype';
import { atomWithHistoryListener } from './atomWithHistory';

export const selection = atom<NodePath | undefined>([]);
const emptyDoc: RaisinDocumentNode = {
  type: ElementType.Root,
  children: [],
};

export const root = atom<RaisinNode>(emptyDoc);

export const [
  rootPrimitive,
  rootWithHistory,
  historyStack,
] = atomWithHistoryListener(root);
