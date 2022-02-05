import { NodePath, RaisinNode } from '@raisins/core';
import { useUpdateAtom } from 'jotai/utils';
import {
  DuplicateNodeAtom, InsertNodeAtom,
  RemoveNodeAtom,
  ReplaceNodeAtom,
  ReplacePathAtom,
  SetNodeInternalAtom
} from './EditAtoms';
import { DeleteSelectedAtom } from "./EditSelectedAtom";
import { StateUpdater } from '../util/NewState';
import { RaisinScope } from '../atoms/RaisinScope';

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
    setNode: useUpdateAtom(SetNodeInternalAtom, RaisinScope),
    deleteSelected: useUpdateAtom(DeleteSelectedAtom, RaisinScope),
    removeNode: useUpdateAtom(RemoveNodeAtom, RaisinScope),
    duplicateNode: useUpdateAtom(DuplicateNodeAtom, RaisinScope),
    insert: useUpdateAtom(InsertNodeAtom, RaisinScope),
    replaceNode: useUpdateAtom(ReplaceNodeAtom, RaisinScope),
    replacePath: useUpdateAtom(ReplacePathAtom, RaisinScope),
  };
}
