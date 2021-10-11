import React, { useEffect, useRef, useState } from 'react';
import { Meta } from '@storybook/react';
import { atom, useAtom } from 'jotai';

const meta: Meta = {
  title: 'Jotai',
};
export default meta;

const a = `{"google":"homepage"}`;
const b = `{"google":"nomepage"}`;
const str = atom(a);
const node = atom<{ google: string }>((get) => JSON.parse(get(str)));
export const JSONMemoized = () => {
  const One = () => {
    const [val, setVal] = useAtom(str);
    return (
      <div>
        String: {val}
        <button onClick={() => setVal((v) => (v === a ? b : a))}>swap</button>
      </div>
    );
  };

  const Two = () => {
    const [obj] = useAtom(node);
    const renderCount = useRef(0);
    const [cnt, setCnt] = useState(0);
    useEffect(() => {
      renderCount.current++;
    }, [obj]);

    return (
      <div>
        Render count {renderCount.current} {obj.google} <br />
        {cnt} <button onClick={() => setCnt((c) => c + 1)}>+1</button>
      </div>
    );
  };

  return (
    <div>
      <One />
      <Two />
    </div>
  );
};
