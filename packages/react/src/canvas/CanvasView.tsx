import { isElementNode } from '@raisins/core';
import { Atom, atom } from 'jotai';
import { molecule, useMolecule } from 'jotai-molecules';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { CSSProperties, FC, Suspense } from 'react';
import { ComponentModelMolecule } from '../component-metamodel/';
import { HoveredNodeMolecule, SelectedNodeMolecule } from '../core/';
import { EditSelectedMolecule } from '../core/editting/EditSelectedAtom';
import { SelectedNodeRichTextEditor } from '../rich-text/';
import { Rect } from './api/Rect';
import { CanvasScopedMolecule } from './CanvasScopedMolecule';
import { CanvasStyleMolecule, Size } from './CanvasStyleMolecule';

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

const CanvasViewMolecule = molecule((getMol) => {
  const CanvasScope = getMol(CanvasScopedMolecule);
  const { ComponentMetaAtom } = getMol(ComponentModelMolecule);
  const { HoveredNodeAtom } = getMol(HoveredNodeMolecule);
  const { SelectedNodeAtom } = getMol(SelectedNodeMolecule);
  const CanvasStyle = getMol(CanvasStyleMolecule);

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

  return {
    ...CanvasScope,
    ...CanvasStyle,
    ...getMol(EditSelectedMolecule),
    SelectedNodeAtom,
    HoveredNodeContent,
    SelectedNodeContent,
  };
});

export const CanvasHoveredToolbar = () => {
  const atoms = useMolecule(CanvasViewMolecule);
  const nodeDetails = useAtomValue(atoms.HoveredNodeContent);
  return (
    <Suspense fallback={null}>
      <PositionedToolbar rectAtom={atoms.HoveredRectAtom}>
        {nodeDetails}
      </PositionedToolbar>
    </Suspense>
  );
};

export const CanvasSelectedToolbar = () => {
  const atoms = useMolecule(CanvasViewMolecule);
  const seleted = useAtomValue(atoms.SelectedNodeAtom);
  const deleteSelected = useUpdateAtom(atoms.DeleteSelectedAtom);
  const cloneSelected = useUpdateAtom(atoms.DuplicateSelectedAtom);
  const moveSelected = useUpdateAtom(atoms.PickSelectedAtom);
  const nodeContent = useAtomValue(atoms.SelectedNodeContent);
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
  const rect = useAtomValue(rectAtom);
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
