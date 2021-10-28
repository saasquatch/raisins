import { htmlParser as parse, RaisinNode } from '@raisins/core';
import { useMemo } from 'react';
import { useCore } from './useCore';
import { useHotkeys } from './useHotkeys';

export function useEditor(initialHTML: string) {
  const initial = useMemo(() => {
    const raisinNode = parse(initialHTML);
    return raisinNode;
  }, [initialHTML]);

  // Sets up history clearing
  useCore(initial);

  // Binds global event handlers
  useHotkeys();
}
