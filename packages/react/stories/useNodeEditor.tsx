import { RaisinNode } from '@raisins/core';
import { PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { useCallback } from 'react';
import { atomForAttributes } from '../src/atoms/atomForAttributes';
import { HistoryAtom } from '../src/atoms/atomWithHistory';
import { atomWithId, getId } from '../src/atoms/atomWithId';
import { atomWithNodePath } from '../src/atoms/atomWithNodePath';

export type NodeProps = Record<string, any>;

export function useNodeEditor(
  nodeAtom: PrimitiveAtom<RaisinNode>,
  selectedAtom: WritableAtom<boolean, boolean | undefined>,
  nodePropsAtom: PrimitiveAtom<NodeProps>,
  historyAtom: HistoryAtom<RaisinNode>
) {
  // Derived from parent atom
  const baseAtom = atomWithId(nodeAtom);
  const [attrs, setAttrs] = useAtom(atomForAttributes(baseAtom));

  const node = useAtomValue(baseAtom);
  const id = getId(node);
  const [selected, toggleSelected] = useAtom(selectedAtom);
  const [nodeProps, setNodeProps] = useAtom(nodePropsAtom);
  const path = useAtomValue(atomWithNodePath(baseAtom));

  const dispatch = useUpdateAtom(historyAtom);
  const undo = useCallback(() => dispatch({ type: 'undo' }), [dispatch]);
  const redo = useCallback(() => dispatch({ type: 'redo' }), [dispatch]);

  return {
    id,
    path,
    selected,
    toggleSelected,
    attrs,
    setAttrs,
    nodeProps,
    setNodeProps,
    undo,
    redo,
  };
}
