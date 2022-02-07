import { isElementNode } from '@raisins/core';
import { atom, PrimitiveAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { CSSProperties, FC } from 'react';
import { RaisinScope } from '../atoms/RaisinScope';
import {
  HoveredAtom,
  HoveredRectAtom,
  SelectedRectAtom,
} from '../canvas/CanvasHoveredAtom';
import { Rect } from '../canvas/Rect';
import { Size } from '../canvas/useCanvas';
import { ComponentMetaAtom } from '../component-metamodel/ComponentModel';
import { DeleteSelectedAtom, DuplicateSelectedAtom, PickSelectedAtom } from "../editting/EditSelectedAtom";
import { SelectedNodeAtom } from '../selection/SelectedAtom';

const Wrapper: CSSProperties = {
  backgroundImage: `linear-gradient(45deg, #cccccc 25%, transparent 25%),
    linear-gradient(-45deg, #cccccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #cccccc 75%),
    linear-gradient(-45deg, transparent 75%, #cccccc 75%)`,
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
  padding: '50px',
};

const Content: CSSProperties = {
  background: 'white',
  margin: '0 auto',
  padding: '20px',
  position: 'relative',
};

export type WYSWIGCanvasProps = {
  size: Size;
  clearSelected: () => void;
  setHtmlRef: (el: HTMLElement | null) => void;
};

export const WYSWIGCanvas: FC<WYSWIGCanvasProps> = (props) => {
  return (
    <div style={Wrapper} onClick={() => props.clearSelected()}>
      <div
        style={{
          ...Content,
          width: props.size.width,
        }}
        data-content
        ref={props.setHtmlRef}
      >
        <CanvasHover />
        <CanvasSelect />
      </div>
    </div>
  );
};

const HoveredNodeContent = atom((get) => {
  const hoveredNode = get(HoveredAtom);
  const metamodel = get(ComponentMetaAtom);
  if (!isElementNode(hoveredNode)) return;

  return metamodel(hoveredNode).title ?? hoveredNode.tagName;
});
export const CanvasHover = () => {
  const nodeDetails = useAtomValue(HoveredNodeContent, RaisinScope);
  return (
    <PositionedToolbar rectAtom={HoveredRectAtom}>
      {nodeDetails}
    </PositionedToolbar>
  );
};

export const CanvasSelect = () => {
  const seleted = useAtomValue(SelectedNodeAtom, RaisinScope)
  const deleteSelected = useUpdateAtom(DeleteSelectedAtom, RaisinScope);
  const cloneSelected = useUpdateAtom(DuplicateSelectedAtom, RaisinScope);
  const moveSelected = useUpdateAtom(PickSelectedAtom, RaisinScope);
  if(!seleted) return <div/>
  return (
    <PositionedToolbar rectAtom={SelectedRectAtom}>
      <button onClick={deleteSelected}>Delete</button>
      <button onClick={cloneSelected}>Dupe</button>
      <button onClick={moveSelected}>Move</button>
    </PositionedToolbar>
  );
};

export const PositionedToolbar = ({
  rectAtom,
  children,
}: {
  rectAtom: PrimitiveAtom<Rect | undefined>;
  children: React.ReactNode;
}) => {
  const rect = useAtomValue(rectAtom, RaisinScope);
  if (!rect)
    return (
      <div style={{ position: 'absolute', top: 0, left: 0, display: 'none' }} />
    );
  const { x, y, width, height } = rect;

  return (
    <div
      style={{
        background: 'green',
        color: 'white',
        position: 'absolute',
        top: y + 20 + height,
        left: x + 20,
      }}
    >
      {children}
    </div>
  );
};
