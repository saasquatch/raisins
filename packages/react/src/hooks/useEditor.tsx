import { htmlParser as parse, RaisinNode } from '@raisins/core';
import { useMemo } from 'react';
import { Model } from '../model/EditorModel';
import { useCore } from './useCore';
import { useHotkeys } from './useHotkeys';

export type DraggableState = Map<
  RaisinNode,
  {
    element?: HTMLElement;
    handle?: HTMLElement;
  }
>;

export function useEditor(initialHTML: string): Model {
  const initial = useMemo(() => {
    const raisinNode = parse(initialHTML);
    return raisinNode;
  }, [initialHTML]);

  const core = useCore(initial);

  // Binds global event handlers
  useHotkeys();

  return {
    ...core,
  };
}
