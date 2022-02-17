import { RaisinNode } from '@raisins/core';
import { PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { useCallback } from 'react';
import { atomForAttributes } from '../src/atoms/atomForAttributes';
import { HistoryAtom } from '../src/atoms/atomWithHistory';
import { atomForNodePath } from '../src/atoms/atomForNodePath';

export type NodeProps = Record<string, any>;

export function useNodeEditor(
  nodeAtom: PrimitiveAtom<RaisinNode>,
  selectedAtom: WritableAtom<boolean, boolean | undefined>,
  nodePropsAtom: PrimitiveAtom<NodeProps>,
  historyAtom: HistoryAtom<RaisinNode>
) {
  // Derived from parent atom
  const baseAtom = nodeAtom;
  const [attrs, setAttrs] = useAtom(atomForAttributes(baseAtom));

  const node = useAtomValue(baseAtom);
  const [selected, toggleSelected] = useAtom(selectedAtom);
  const [nodeProps, setNodeProps] = useAtom(nodePropsAtom);
  const path = useAtomValue(atomForNodePath(baseAtom));

  const dispatch = useUpdateAtom(historyAtom);
  const undo = useCallback(() => dispatch({ type: 'undo' }), [dispatch]);
  const redo = useCallback(() => dispatch({ type: 'redo' }), [dispatch]);

  return {
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
