import SlButton from '@shoelace-style/react/dist/button';
import SlButtonGroup from '@shoelace-style/react/dist/button-group';
import SlIcon from '@shoelace-style/react/dist/icon';
import { useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import { HistorySizeAtom, RedoAtom, UndoAtom } from '../editting/HistoryAtoms';
import { ModeAtom, OutlineAtom, SizeAtom, sizes } from '../canvas/useCanvas';

const ToolbarStyle = styled.div`
  padding: 10px;
  & > * {
    margin-left: 5px;
  }
`;

export function ToolbarView() {
  const historySize = useAtom(HistorySizeAtom)[0];
  const undo = useUpdateAtom(UndoAtom);
  const redo = useUpdateAtom(RedoAtom);
  const [mode, setMode] = useAtom(ModeAtom);
  const [size, setSize] = useAtom(SizeAtom);
  const [outlined, setOutlined] = useAtom(OutlineAtom);

  return (
    <ToolbarStyle>
      Toolbar
      <SlButtonGroup>
        <SlButton
          size="small"
          pill
          onClick={undo}
          disabled={historySize.undoSize <= 0}
        >
          <SlIcon slot="prefix" name="arrow-90deg-left" />
          Undo ({historySize.undoSize})
        </SlButton>
        <SlButton
          size="small"
          pill
          onClick={redo}
          disabled={historySize.redoSize <= 0}
        >
          <SlIcon slot="prefix" name="arrow-90deg-right" />
          Redo ({historySize.redoSize})
        </SlButton>
      </SlButtonGroup>
      <SlButtonGroup>
        {mode}
        <SlButton
          size="small"
          pill
          disabled={mode === 'edit'}
          onClick={() => setMode('edit')}
        >
          <SlIcon slot="prefix" name="pencil" />
          Edit
        </SlButton>
        <SlButton
          size="small"
          pill
          disabled={mode === 'preview'}
          onClick={() => setMode('preview')}
        >
          <SlIcon slot="prefix" name="eye"></SlIcon>
          Preview
        </SlButton>
        <SlButton
          size="small"
          pill
          disabled={mode === 'html'}
          onClick={() => setMode('html')}
        >
          <SlIcon slot="prefix" name="eye"></SlIcon>
          HTML
        </SlButton>
      </SlButtonGroup>
      <SlButtonGroup>
        <SlButton
          size="small"
          pill
          type="default"
          disabled
          style={{ cursor: 'initial' } as CSSProperties & CSSStyleDeclaration}
        >
          <SlIcon slot="prefix" name="window"></SlIcon>
          Screen
        </SlButton>

        {sizes.map((s) => (
          <SlButton
            size="small"
            pill
            onClick={() => setSize(s)}
            disabled={size === s}
          >
            {s.name}
          </SlButton>
        ))}
      </SlButtonGroup>
      <SlButtonGroup>
        <SlButton
          size="small"
          pill
          type="default"
          onClick={() => setOutlined((o) => !o)}
          style={{ cursor: 'initial' } as CSSProperties & CSSStyleDeclaration}
        >
          <SlIcon slot="prefix" name="window"></SlIcon>
          {outlined ? 'Outlined' : 'No Outline'}
        </SlButton>
      </SlButtonGroup>
    </ToolbarStyle>
  );
}
