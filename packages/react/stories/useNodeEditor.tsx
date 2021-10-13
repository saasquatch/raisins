import { RaisinNode } from '@raisins/core';
import { PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import { useUpdateAtom, useAtomValue } from 'jotai/utils';
import { useCallback } from 'react';
import { atomForAttributes } from '../src/atoms/atomForAttributes';
import { HistoryAction } from '../src/atoms/atomWithHistory';
import { atomWithId, getId, primitiveWithId } from '../src/atoms/atomWithId';
import { atomWithNodePath } from '../src/atoms/atomWithNodePath';

export type NodeProps = Record<string, any>;

export function useNodeEditor(
  nodeAtom: PrimitiveAtom<RaisinNode>,
  selectedAtom: WritableAtom<boolean, boolean | undefined>,
  nodePropsAtom: PrimitiveAtom<NodeProps>,
  historyAtom: WritableAtom<unknown, HistoryAction>
) {
  // Derived from parent atom
  const [attrs, setAttrs] = useAtom(
    atomForAttributes(primitiveWithId(nodeAtom))
  );

  const id = getId(useAtomValue(nodeAtom));
  const [selected, toggleSelected] = useAtom(selectedAtom);
  const [nodeProps, setNodeProps] = useAtom(nodePropsAtom);
  const dispatch = useUpdateAtom(historyAtom);
  const [path] = useAtom(atomWithNodePath(nodeAtom));

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
