import { NodePath, RaisinDocumentNode, RaisinNode } from '@raisins/core';
import { atom } from 'jotai';
import { ElementType } from 'domelementtype';
import { atomWithHistoryListener } from './atomWithHistory';

export const selection = atom<NodePath | undefined>([]);
selection.debugLabel = 'selection';

const emptyDoc: RaisinDocumentNode = {
  type: ElementType.Root,
  children: [],
};

export const root = atom<RaisinNode>(emptyDoc);
root.debugLabel = 'root';

export const [
  rootPrimitive,
  rootWithHistory,
  historyStack,
] = atomWithHistoryListener(root);
