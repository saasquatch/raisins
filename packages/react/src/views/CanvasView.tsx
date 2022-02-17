import { isElementNode } from '@raisins/core';
import { Atom, atom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { CSSProperties, FC, Suspense } from 'react';
import { RaisinScope } from '../atoms/RaisinScope';
import { HoveredNodeAtom } from '../core/selection/HoveredAtom';
import { Rect } from '../canvas/api/Rect';
import { Size, useCanvasAtoms } from '../canvas/useCanvas';
import { ComponentMetaAtom } from '../component-metamodel/ComponentModel';
import {
  DeleteSelectedAtom,
  DuplicateSelectedAtom,
  PickSelectedAtom,
} from '../core/editting/EditSelectedAtom';
import SelectedNodeRichTextEditor from '../rich-text/RichTextEditor';
import { SelectedNodeAtom } from '../core/selection/SelectedAtom';

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
  transition: 'width 300ms',
};

export type WYSWIGCanvasProps = {
  size: Size;
  clearSelected: () => void;
  setHtmlRef: (el: HTMLElement | null) => void;
};

export const WYSWIGCanvas: FC<WYSWIGCanvasProps> = (props) => {
  return (
    <div style={Wrapper}>
      <div
        style={{
          ...Content,
          width: props.size.width,
        }}
        data-content
        ref={props.setHtmlRef}
      >
        <CanvasHoveredToolbar />
        <CanvasSelectedToolbar />
      </div>
    </div>
  );
};

const HoveredNodeContent = atom((get) => {
  const node = get(HoveredNodeAtom);
  const metamodel = get(ComponentMetaAtom);
  if (!isElementNode(node)) return;
  return metamodel(node.tagName).title ?? node.tagName;
});

const SelectedNodeContent = atom((get) => {
  const node = get(SelectedNodeAtom);
  const metamodel = get(ComponentMetaAtom);
  if (!isElementNode(node)) return;
  return metamodel(node.tagName).title ?? node.tagName;
});

export const CanvasHoveredToolbar = () => {
  const atoms = useCanvasAtoms();
  const nodeDetails = useAtomValue(HoveredNodeContent, RaisinScope);
  return (
    <Suspense fallback={null}>
      <PositionedToolbar rectAtom={atoms.HoveredRectAtom}>
        {nodeDetails}
      </PositionedToolbar>
    </Suspense>
  );
};

export const CanvasSelectedToolbar = () => {
  const atoms = useCanvasAtoms();
  const seleted = useAtomValue(SelectedNodeAtom, RaisinScope);
  const deleteSelected = useUpdateAtom(DeleteSelectedAtom, RaisinScope);
  const cloneSelected = useUpdateAtom(DuplicateSelectedAtom, RaisinScope);
  const moveSelected = useUpdateAtom(PickSelectedAtom, RaisinScope);
  const nodeContent = useAtomValue(SelectedNodeContent, RaisinScope);
  if (!seleted) return <div />;
  return (
    <Suspense fallback={null}>
      <PositionedToolbar rectAtom={atoms.SelectedRectAtom}>
        {nodeContent}
        <button onClick={deleteSelected}>Delete</button>
        <button onClick={cloneSelected}>Dupe</button>
        <button onClick={moveSelected}>Move</button>

        <hr />
        <SelectedNodeRichTextEditor />
      </PositionedToolbar>
    </Suspense>
  );
};

export const PositionedToolbar = ({
  rectAtom,
  children,
}: {
  rectAtom: Atom<Promise<Rect | undefined>>;
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
        width: width + 'px',
        minWidth: '200px',
      }}
    >
      {children}
    </div>
  );
};
