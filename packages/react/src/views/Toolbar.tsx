import { useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { CSSProperties } from 'react';
import { RaisinScope } from '../atoms/RaisinScope';
import { HoveredBreadcrumbs } from '../canvas/CanvasHoveredAtom';
import { ModeAtom, OutlineAtom, SizeAtom, sizes } from '../canvas/useCanvas';
import { HistorySizeAtom, RedoAtom, UndoAtom } from '../editting/HistoryAtoms';

export function ToolbarView() {
  const historySize = useAtom(HistorySizeAtom, RaisinScope)[0];
  const undo = useUpdateAtom(UndoAtom, RaisinScope);
  const redo = useUpdateAtom(RedoAtom, RaisinScope);
  const [mode, setMode] = useAtom(ModeAtom, RaisinScope);
  const [size, setSize] = useAtom(SizeAtom, RaisinScope);
  const [outlined, setOutlined] = useAtom(OutlineAtom, RaisinScope);

  const hovered = useAtomValue(HoveredBreadcrumbs, RaisinScope);

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
      Hovered: {hovered}
    </div>
  );
}
