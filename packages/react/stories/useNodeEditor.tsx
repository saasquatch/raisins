import { RaisinNode } from '@raisins/core';
import { PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { atomForAttributes } from './atomForAttributes';
import { HistoryAction } from './atomWithHistory';

export type NodeProps = Record<string, any>;

export function useNodeEditor(
  nodeAtom: PrimitiveAtom<RaisinNode>,
  selectedAtom: WritableAtom<boolean, boolean | undefined>,
  nodePropsAtom: PrimitiveAtom<NodeProps>,
  historyAtom: WritableAtom<unknown, HistoryAction>
) {
  // Derived from parent atom
  const [attrs, setAttrs] = useAtom(atomForAttributes(nodeAtom));

  const [selected, toggleSelected] = useAtom(selectedAtom);
  const [nodeProps, setNodeProps] = useAtom(nodePropsAtom);
  const dispatch = useUpdateAtom(historyAtom);

  const undo = () => dispatch({ type: 'undo' });
  const redo = () => dispatch({ type: 'redo' });

  return {
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
