import {
  getNode,
  getPath,
  isElementNode,
  NodePath,
  NodeSelection,
  RaisinNode,
} from '@raisins/core';
import { atom, Getter, PrimitiveAtom, SetStateAction } from 'jotai';
import { molecule } from 'jotai-molecules';
import { SelectionBookmark } from 'prosemirror-state';
import { isFunction } from '../../util/isFunction';
import { CoreMolecule } from '../CoreAtoms';
import { Soul, SoulsMolecule } from '../souls/Soul';
import { SoulsInDocMolecule } from '../souls/SoulsInDocumentAtoms';

export type Selection = RichTextSelection | NodeSelection;

export type RichTextSelection = {
  type: 'text';
  path: NodePath;
  bookmark: SelectionBookmark;
};

export const SelectedNodeMolecule = molecule((getMol) => {
  const { RootNodeAtom } = getMol(CoreMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);
  const { SoulToNodeAtom } = getMol(SoulsInDocMolecule);

  const SelectionAtom = atom<Selection | undefined>(undefined);

  /**
   * @deprecated use {@link SelectionAtom} or {@link SelectedNodeAtom} instead
   */
  const SelectedAtom = atom(
    (get) => get(SelectionAtom),
    (get, set, next?: RaisinNode | undefined) => {
      const nextPath = next
        ? ({ type: 'node', path: getPath(get(RootNodeAtom), next)! } as const)
        : undefined;

      set(SelectionAtom, nextPath);
    }
  );

  function getSelected(get: Getter) {
    const current = get(RootNodeAtom);
    const selected = get(SelectedAtom);
    return selected?.path ? getNode(current, selected.path) : undefined;
  }

  const SelectedNodeAtom = atom(
    (get) => {
      return getSelected(get);
    },
    (get, set, next: SetStateAction<RaisinNode | undefined>) =>
      set(SelectedAtom, isFunction(next) ? next(getSelected(get)) : next)
  );

  const SelectedBookmark: PrimitiveAtom<SelectionBookmark | undefined> = atom(
    (get) => {
      const selection = get(SelectionAtom);
      if (selection?.type === 'text') {
        return selection.bookmark;
      }
      return undefined;
    },
    (get, set, next) => {
      const nextValue = isFunction(next) ? next(get(SelectedBookmark)) : next;
      console.log('Change bookmark', nextValue);
      set(SelectionAtom, (prev) => {
        if (prev?.type === 'node' && nextValue) {
          // When text selection is set
          // And a node is selected
          // Then the selection becomes a node selection
          return {
            type: 'text',
            path: prev.path,
            bookmark: nextValue,
          };
        } else if (prev?.type === 'text' && nextValue) {
          // When text selection is set
          // And text is currently selected
          // Then change it
          return {
            ...prev,
            bookmark: nextValue,
          };
        } else if (prev?.type === 'text' && !nextValue) {
          // When text selection is cleared
          // And text selection exists
          // Then it goes back to node selection
          return {
            type: 'node',
            path: prev?.path,
          };
        } else {
          // When text selection is cleared or changed
          // But there isn't text selection
          // Then don't change selection state
          // Because this should never happen
          return prev;
        }
      });
    }
  );

  const SelectedSoulAtom = atom(
    (get) => {
      const getSoul = get(GetSoulAtom);
      const node = get(SelectedNodeAtom);
      if (!node) return undefined;
      return getSoul(node);
    },
    (get, set, next: Soul | undefined) => {
      if (!next) {
        set(SelectedAtom, undefined);
        return;
      }
      const getNode = get(SoulToNodeAtom);
      const node = getNode(next);
      set(SelectedAtom, node);
    }
  );

  const HasSelectionAtom = atom((get) => get(SelectionAtom) !== undefined);

  return {
    SelectionAtom,
    SelectedAtom,
    SelectedNodeAtom,
    SelectedSoulAtom,
    SelectedPathString: atom((get) => get(SelectedAtom)?.path.toString),
    SelectedIsElement: atom((get) => isElementNode(get(SelectedNodeAtom))),
    HasSelectionAtom,
    SelectedBookmark,
  };
});
