import React from 'react';

export function NodeEditorView({
  selected,
  toggleSelected,
  attrs,
  setAttrs,
  nodeProps,
  setNodeProps,
  undo,
  redo,
  children = [],
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          {selected ? 'selected' : 'not selected'}{' '}
          <button onClick={() => toggleSelected()}>Toggle Selected</button>
        </div>
        <div>
          Attributes
          <br />
          <pre>{JSON.stringify(attrs)}</pre>
          <button onClick={() => setAttrs({ foo: 'bar' })}>Bar</button>
          <button onClick={() => setAttrs({ baz: 'baz' })}>Baz</button>
        </div>
        <div>
          Props <br />
          <pre>{JSON.stringify(nodeProps)}</pre>
          <button onClick={() => setNodeProps({ one: 'yes' })}>Prop One</button>
          <button onClick={() => setNodeProps({ two: 'nope' })}>
            Prop Two
          </button>
        </div>
        <div>
          History
          <br />
          <button onClick={undo}>Undo</button>
          <button onClick={redo}>Redo</button>
        </div>
      </div>
      <div style={{ borderLeft: '5px solid #CCC', paddingLeft: '5px' }}>
        Children <br />
        {children}
      </div>
    </div>
  );
}
