import { htmlParser as parse, RaisinNode, NodeSelection } from '@raisins/core';
import { useMemo, useState } from 'react';
import { Model } from '../model/EditorModel';
import useCanvas from './useCanvas';
import { useComponentModel } from './useComponentModel';
import { useCore } from './useCore';
import { useHotkeys } from './useHotkeys';
import { useStyleEditor } from './useStyleEditor';

export type DraggableState = Map<
  RaisinNode,
  {
    element?: HTMLElement;
    handle?: HTMLElement;
  }
>;

export function useEditor(initialHTML: string): Model {
  const metamodel = useComponentModel();
  const initial = useMemo(() => {
    const raisinNode = parse(initialHTML);
    return raisinNode;
  }, [initialHTML]);

  const core = useCore(metamodel, initial);


  // Binds global event handlers
  useHotkeys(core);

  // @ts-ignore
  return {
    ...core,
    ...useStyleEditor({
      node: core.node,
      setNode: core.setNode,
      parents: core.parents,
      componentModel: metamodel,
    }),
    ...metamodel,
    ...useCanvas({...core, ...metamodel}),
  };
}
