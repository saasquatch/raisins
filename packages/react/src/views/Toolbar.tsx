import { useAtom } from 'jotai';
import { molecule, useMolecule } from 'jotai-molecules';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { CSSProperties } from 'react';
import { CanvasStyleMolecule, sizes } from '../canvas/CanvasStyleMolecule';
import { HistoryMolecule } from '../core/editting/HistoryAtoms';
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
  const historySize = useAtom(atoms.HistorySizeAtom)[0];
  const undo = useUpdateAtom(atoms.UndoAtom);
  const redo = useUpdateAtom(atoms.RedoAtom);
  const [mode, setMode] = useAtom(atoms.ModeAtom);
  const [size, setSize] = useAtom(atoms.SizeAtom);
  const [outlined, setOutlined] = useAtom(atoms.OutlineAtom);

  const hovered = useAtomValue(atoms.HoveredBreadcrumbsAtom);

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
