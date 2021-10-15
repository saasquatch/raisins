import { RaisinNode } from '@raisins/core';
import { Meta } from '@storybook/react';
import { ElementType } from 'domelementtype';
import { atom, Getter, Setter, useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import React from 'react';
import { atomForAttributes } from '../src/atoms/atomForAttributes';
import { atomWithId, getId } from '../src/atoms/atomWithId';
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

const objAtom = atom({});
const objAtomWithId = atomWithId(objAtom);
export function AtomWithHiddenId() {
  const [obj, setObj] = useAtom(objAtomWithId);
  const updateBase = useUpdateAtom(objAtom);

  const nextVal = Math.random();
  return (
    <div>
      Value: <code>{JSON.stringify(obj)}</code>
      <br />
      ID: {getId(obj)}
      <br />
      <button onClick={() => setObj({ val: nextVal })}>Set to {nextVal}</button>
      <button onClick={() => updateBase({ val: nextVal })}>
        Set base to {nextVal}
      </button>
    </div>
  );
}

const nodeAtom = atom({
  type: ElementType.Tag,
  tagName: 'span',
  attribs: {},
  attrs: {
    foo: 'Bar',
  },
  children: [],
} as RaisinNode);
const nodeAtomWithId = atomWithId(nodeAtom);
const nodeAttrs = atomForAttributes(nodeAtomWithId);
export function NodeWithHiddenId() {
  const [obj, setObj] = useAtom(nodeAttrs);
  const updateBase = useUpdateAtom(atomForAttributes(nodeAtom));
  const [baseNode] = useAtom(nodeAtom);

  const nextVal = Math.random() + '';
  return (
    <div>
      Value: <code>{JSON.stringify(obj)}</code>
      <br />
      ID: {getId(baseNode)}
      <br />
      <button onClick={() => setObj({ val: nextVal })}>Set to {nextVal}</button>
      <button onClick={() => updateBase({ val: nextVal })}>
        Set base to {nextVal}
      </button>
    </div>
  );
}
