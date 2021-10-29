import { useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import React, { CSSProperties } from 'react';
import { HistorySizeAtom, RedoAtom, UndoAtom } from '../editting/HistoryAtoms';
import { ModeAtom, OutlineAtom, SizeAtom, sizes } from '../canvas/useCanvas';

export function ToolbarView() {
  const historySize = useAtom(HistorySizeAtom)[0];
  const undo = useUpdateAtom(UndoAtom);
  const redo = useUpdateAtom(RedoAtom);
  const [mode, setMode] = useAtom(ModeAtom);
  const [size, setSize] = useAtom(SizeAtom);
  const [outlined, setOutlined] = useAtom(OutlineAtom);

  return (
    <div>
      Toolbar
      <button onClick={undo} disabled={historySize.undoSize <= 0}>
        Undo ({historySize.undoSize})
      </button>
      <button onClick={redo} disabled={historySize.redoSize <= 0}>
        Redo ({historySize.redoSize})
      </button>
      {mode}
      <button disabled={mode === 'edit'} onClick={() => setMode('edit')}>
        Edit
      </button>
      <button disabled={mode === 'preview'} onClick={() => setMode('preview')}>
        Preview
      </button>
      <button disabled={mode === 'html'} onClick={() => setMode('html')}>
        HTML
      </button>
      <button
        disabled
        style={{ cursor: 'initial' } as CSSProperties & CSSStyleDeclaration}
      >
        Screen
      </button>
      {sizes.map((s) => (
        <button onClick={() => setSize(s)} disabled={size === s} key={s.name}>
          {s.name}
        </button>
      ))}
      <button
        onClick={() => setOutlined((o) => !o)}
        style={{ cursor: 'initial' } as CSSProperties & CSSStyleDeclaration}
      >
        {outlined ? 'Outlined' : 'No Outline'}
      </button>
    </div>
  );
}
