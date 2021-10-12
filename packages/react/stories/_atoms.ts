import { NodePath, RaisinDocumentNode, RaisinNode } from '@raisins/core';
import { atom } from 'jotai';
import { ElementType } from 'domelementtype';

export const selection = atom<NodePath>([]);
const emptyDoc: RaisinDocumentNode = {
  type: ElementType.Root,
  children: [],
};
export const root = atom<RaisinNode>(emptyDoc);
