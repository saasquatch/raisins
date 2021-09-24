import { htmlParser as parse } from '@raisins/core';
import { act, renderHook } from '@testing-library/react-hooks';
import { useMemo } from 'react';
import { useComponentModel } from './useComponentModel';
import { useCore } from './useCore';

test('should increment counter', () => {
  const initialHTML = `<div><span>I am a span</span></div>`;

  const { result } = renderHook(() => {
    const model = useComponentModel();
    const initial = useMemo(() => {
      const raisinNode = parse(initialHTML);
      return raisinNode;
    }, [initialHTML]);

    return useCore(model, initial);
  });

  expect(result.current.hasRedo).toBe(false);
  expect(result.current.hasUndo).toBe(false);

  const newHtml = '<div>Manually editted</div>';
  act(() => {
    result.current.setHtml(newHtml);
  });

  expect(result.current.hasRedo).toBe(false);
  expect(result.current.hasUndo).toBe(true);
  expect(result.current.html).toBe(newHtml);

  act(() => {
    result.current.undo();
  });

  expect(result.current.hasRedo).toBe(true);
  expect(result.current.hasUndo).toBe(false);
  expect(result.current.html).toBe(initialHTML);

  act(() => {
    result.current.redo();
  });

  expect(result.current.hasRedo).toBe(false);
  expect(result.current.hasUndo).toBe(true);
  expect(result.current.html).toBe(newHtml);
});
