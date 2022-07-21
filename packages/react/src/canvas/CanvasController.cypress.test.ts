//
import { htmlParser } from '@raisins/core';
import { act, renderHook } from '@testing-library/react-hooks/dom';
import { useCallback, useState } from 'react';
import expect from 'expect';

function useCounter() {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => setCount((x) => x + 1), []);

  return { count, increment };
}

export default useCounter;

describe('Thing', () => {
  it('Works', () => {
    const template = htmlParser('<div>I am html</div>');
    // throw new Error("No it don't");
  });

  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    if (result.current.count !== 1) {
      throw new Error('Not right');
    }
    expect(result.current.count).toBe(1);
  });
});
