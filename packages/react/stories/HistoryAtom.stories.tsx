import { Meta } from '@storybook/react';
import { atom, Getter, Setter, useAtom } from 'jotai';
import React from 'react';
import { atomWithSetStateListener } from '../src/atoms/atomWithSetterListener';

const meta: Meta = {
  title: 'Listener Atom',
};
export default meta;

const historyAtom = atom([]);
const countAtom = atom(0);

// Derived state
const listener = (
  get: Getter,
  set: Setter,
  prev: number,
  next: number
): void => {
  const prevHistory = get(historyAtom);
  set(historyAtom, [...prevHistory, [prev, next]]);
};
const countWithListener = atomWithSetStateListener(countAtom, listener);
export function AtomWithHistory() {
  const [state, setState] = useAtom(countWithListener);
  const [history, setHistory] = useAtom(historyAtom);
  return (
    <div>
      <p>Tests wrapping an atom to provide history of what changed</p>
      {state} <button onClick={() => setState((c) => c + 1)}>+1</button>{' '}
      <button onClick={() => setState((c) => c - 1)}>-1</button>
      <button onClick={() => setState(0)}>zero</button>
      <button onClick={() => setHistory([])}>clear history</button>
      <hr />
      <pre>{JSON.stringify(history, null, 2)}</pre>
    </div>
  );
}
