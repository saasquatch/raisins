import styled from 'styled-components';
import SlButton from '@shoelace-style/react/dist/button';
import SlButtonGroup from '@shoelace-style/react/dist/button-group';
import SlIcon from '@shoelace-style/react/dist/icon';
import React, { CSSProperties } from 'react';
import { Model } from '../model/EditorModel';
import { useAtom } from 'jotai';
import { HistorySizeAtom, RedoAtom, UndoAtom } from "../hooks/HistoryAtoms";
import { useAtomValue, useUpdateAtom } from 'jotai/utils';

const ToolbarStyle = styled.div`
  padding: 10px;
  & > * {
    margin-left: 5px;
  }
`;

function useToolbar() {}

export function ToolbarView(props: Model) {
  const sizes = useAtom(HistorySizeAtom)[0];
  const undo = useUpdateAtom(UndoAtom);
  const redo = useUpdateAtom(RedoAtom);

  return (
    <ToolbarStyle>
      Toolbar
      <SlButtonGroup>
        <SlButton
          size="small"
          pill
          onClick={undo}
          disabled={sizes.undoSize <= 0}
        >
          <SlIcon slot="prefix" name="arrow-90deg-left" />
          Undo ({sizes.undoSize})
        </SlButton>
        <SlButton
          size="small"
          pill
          onClick={redo}
          disabled={sizes.redoSize <= 0}
        >
          <SlIcon slot="prefix" name="arrow-90deg-right" />
          Redo ({sizes.redoSize})
        </SlButton>
      </SlButtonGroup>
      <SlButtonGroup>
        {props.mode}
        <SlButton
          size="small"
          pill
          type={props.mode === 'edit' ? 'success' : 'default'}
          onClick={() => props.setMode('edit')}
        >
          <SlIcon slot="prefix" name="pencil" />
          Edit
        </SlButton>
        <SlButton
          size="small"
          pill
          type={props.mode === 'preview' ? 'success' : 'default'}
          onClick={() => props.setMode('preview')}
        >
          <SlIcon slot="prefix" name="eye"></SlIcon>
          Preview
        </SlButton>
        <SlButton
          size="small"
          pill
          type={props.mode === 'html' ? 'success' : 'default'}
          onClick={() => props.setMode('html')}
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

        {props.sizes.map((s) => (
          <SlButton
            size="small"
            pill
            onClick={() => props.setSize(s)}
            type={props.size === s ? 'success' : 'default'}
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
          onClick={() => props.setOutlined(!props.outlined)}
          style={{ cursor: 'initial' } as CSSProperties & CSSStyleDeclaration}
        >
          <SlIcon slot="prefix" name="window"></SlIcon>
          {props.outlined ? 'Outlined' : 'No Outline'}
        </SlButton>
      </SlButtonGroup>
    </ToolbarStyle>
  );
}
