import { useAtom } from 'jotai';
import { molecule, useMolecule } from 'jotai-molecules';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { CSSProperties } from 'react';
import { CanvasStyleMolecule, sizes } from '../canvas/useCanvas';
import { HistoryMolecule } from '../core/editting/HistoryAtoms';
import { RaisinScope } from '../core/RaisinScope';
import { HoveredNodeMolecule } from '../core/selection/HoveredNode';

const ToolbarMolecule = molecule((getMol) => {
  return {
    ...getMol(HoveredNodeMolecule),
    ...getMol(HistoryMolecule),
    ...getMol(CanvasStyleMolecule),
  };
});

export function ToolbarController() {
  const atoms = useMolecule(ToolbarMolecule);
  const historySize = useAtom(atoms.HistorySizeAtom, RaisinScope)[0];
  const undo = useUpdateAtom(atoms.UndoAtom, RaisinScope);
  const redo = useUpdateAtom(atoms.RedoAtom, RaisinScope);
  const [mode, setMode] = useAtom(atoms.ModeAtom, RaisinScope);
  const [size, setSize] = useAtom(atoms.SizeAtom, RaisinScope);
  const [outlined, setOutlined] = useAtom(atoms.OutlineAtom, RaisinScope);

  const hovered = useAtomValue(atoms.HoveredBreadcrumbsAtom, RaisinScope);

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
