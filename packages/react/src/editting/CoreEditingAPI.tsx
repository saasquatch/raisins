import { NodePath, RaisinNode } from '@raisins/core';
import { useUpdateAtom } from 'jotai/utils';
import {
  DeleteSelectedAtom,
  DuplicateNodeAtom, InsertNodeAtom,
  RemoveNodeAtom,
  ReplaceNodeAtom,
  ReplacePathAtom,
  SetNodeInternalAtom
} from './EditAtoms';
import { StateUpdater } from '../util/NewState';

/*
 * Mutations
 */

export type CoreEditingAPI = {
  setNode: StateUpdater<RaisinNode>;
  deleteSelected(): void;
  duplicateNode(node: RaisinNode): void;
  removeNode(node: RaisinNode): void;
  insert(next: { node: RaisinNode; parent: RaisinNode; idx: number; }): void;
  replaceNode(next: { prev: RaisinNode; next: RaisinNode; }): void;
  replacePath(next: { prev: NodePath; next: RaisinNode; }): void;
};

export function useCoreEditingApi(): CoreEditingAPI {
  return {
    setNode: useUpdateAtom(SetNodeInternalAtom),
    deleteSelected: useUpdateAtom(DeleteSelectedAtom),
    removeNode: useUpdateAtom(RemoveNodeAtom),
    duplicateNode: useUpdateAtom(DuplicateNodeAtom),
    insert: useUpdateAtom(InsertNodeAtom),
    replaceNode: useUpdateAtom(ReplaceNodeAtom),
    replacePath: useUpdateAtom(ReplacePathAtom),
  };
}
