import { useMemo, useState } from 'react';
import { htmlParser as parse, RaisinNode } from "@raisins/core"
import { Model } from '../model/EditorModel';
import useCanvas from './useCanvas';
import { useComponentModel } from './useComponentModel';
import { useCore } from './useCore';
import { useDND } from './useDragState';
import { useStyleEditor } from './useStyleEditor';

export type Mode = 'preview' | 'edit' | 'html';

export type InternalState = {
  current: RaisinNode;
  undoStack: RaisinNode[];
  redoStack: RaisinNode[];
  selected?: RaisinNode;
};

export type DraggableState = Map<
  RaisinNode,
  {
    element?: HTMLElement;
    handle?: HTMLElement;
  }
>;

const nodeToId = new WeakMap<RaisinNode, string>();

export function getId(node: RaisinNode): string {
  const existing = nodeToId.get(node);
  if (existing) {
    return existing;
  }
  const id = 'node-' + Math.round(Math.random() * 10000);
  nodeToId.set(node, id);
  return id;
}

export function useEditor(initialHTML:string): Model {
  const metamodel = useComponentModel();
  const initial = useMemo(() => {
    const raisinNode = parse(initialHTML);
    return raisinNode;
  }, [initialHTML]);

  const core = useCore(metamodel, initial);
  const [mode, setMode] = useState<Mode>('edit');

  // @ts-ignore
  return {
    ...core,
    getId,
    mode,
    setMode,
    ...useStyleEditor({ node: core.node, setNode: core.setNode, parents: core.parents, componentModel: metamodel }),
    ...metamodel,
    ...useCanvas({ selected: core.selected, setNodeInternal: core.setNodeInternal }),
    ...useDND({ node: core.node, setNode: core.setNode, parents: core.parents, componentModel: metamodel }),
  };
}
