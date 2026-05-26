import { htmlParser, RaisinDocumentNode, RaisinElementNode } from '@raisins/core';
import { Meta } from '@storybook/react';
import { useMolecule } from 'bunshi/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { CSSProperties } from 'react';
import {
  PickAndPlopMolecule,
  SelectedNodeController,
} from '../core';
import { Block, ComponentModelMolecule } from '../component-metamodel';
import {
  big,
  MintComponents,
  mintMono,
} from '../examples/MintComponents';
import {
  referrerWidget,
  VanillaComponents,
} from '../examples/VanillaComponents';
import { useHotkeys } from '../hotkeys';
import { BasicStory } from '../index.stories';
import { AttributesController } from '../attributes';
import { DragAndDropMolecule } from '../core/selection/DragAndDropMolecule';
import { useDragBlock, useDropTarget } from './useDragAndDrop';
import {
  NodeChildrenEditor,
  ChildrenEditorForAtoms,
} from '../node/NodeChildrenEditor';
import { NodeMolecule } from '../node/NodeMolecule';
import { NodeScopeProvider } from '../node/NodeScope';
import { SlotChildrenController } from '../node/slots/SlotChildrenController';
import { SlotMolecule, SlotScopeProvider } from '../node/slots/SlotScope';
import { NodeRichTextController } from '../rich-text/RichTextEditor';
import { CoreMolecule } from '../core/CoreAtoms';
import {
  BasicCanvasController,
  CanvasDragAndDropMolecule,
  CanvasDragDropWrapper,
  CanvasHoveredMolecule,
  CanvasPickAndPlopMolecule,
  CanvasProvider,
  CanvasSelectionMolecule,
} from '../canvas';

const meta: Meta = {
  title: 'Drag and Drop',
};
export default meta;

// -- Styles --

const EditorContainer: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '240px 1fr 240px',
  gridTemplateRows: '1fr',
  gap: '12px',
  height: '100vh',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: '13px',
  color: '#1a1a1a',
  background: '#f5f5f5',
};

const SidebarStyle: CSSProperties = {
  background: '#ffffff',
  borderRight: '1px solid #e0e0e0',
  padding: '16px',
  overflowY: 'auto',
};

const CanvasArea: CSSProperties = {
  padding: '16px',
  overflowY: 'auto',
  background: '#ffffff',
  borderRadius: '8px',
  margin: '8px 0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
};

const PropertiesPanel: CSSProperties = {
  background: '#ffffff',
  borderLeft: '1px solid #e0e0e0',
  padding: '16px',
  overflowY: 'auto',
};

const BlockItem: CSSProperties = {
  padding: '10px 12px',
  margin: '4px 0',
  background: '#f8f9fa',
  border: '1px solid #e0e0e0',
  borderRadius: '6px',
  cursor: 'grab',
  fontSize: '12px',
  fontWeight: 500,
  transition: 'all 0.15s ease',
  userSelect: 'none',
};

const BlockItemDragging: CSSProperties = {
  ...BlockItem,
  opacity: 0.5,
  background: '#e3f2fd',
  border: '1px solid #90caf9',
};

const SectionTitle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: '#666',
  marginBottom: '8px',
  marginTop: '16px',
};

const DropZone: CSSProperties = {
  border: '2px dashed #90caf9',
  borderRadius: '4px',
  padding: '4px 8px',
  margin: '2px 0',
  textAlign: 'center',
  fontSize: '11px',
  color: '#1976d2',
  transition: 'all 0.2s ease',
  background: '#e3f2fd',
};

const DropZoneHover: CSSProperties = {
  ...DropZone,
  border: '2px solid #1976d2',
  padding: '12px 8px',
  background: '#bbdefb',
  transform: 'scaleY(1.3)',
  fontWeight: 600,
};

// -- Layer styles --

const LayerItem: CSSProperties = {
  padding: '6px 8px',
  margin: '2px 0',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background 0.1s ease',
};

const LayerItemSelected: CSSProperties = {
  ...LayerItem,
  background: '#e3f2fd',
  border: '1px solid #90caf9',
};

const LayerItemHovered: CSSProperties = {
  ...LayerItem,
  background: '#f5f5f5',
};

const SlotContainer: CSSProperties = {
  marginLeft: '12px',
  borderLeft: '2px solid #e0e0e0',
  paddingLeft: '8px',
};

const SlotLabel: CSSProperties = {
  fontSize: '10px',
  color: '#999',
  textTransform: 'uppercase',
  letterSpacing: '0.3px',
  margin: '4px 0 2px',
};

// -- Components --

const fakeBlocks: Block[] = [
  {
    title: 'Div',
    content: htmlParser('<div>New div block</div>')
      .children[0] as RaisinElementNode,
  },
  {
    title: 'Paragraph',
    content: htmlParser('<p>New paragraph</p>')
      .children[0] as RaisinElementNode,
  },
  {
    title: 'Heading',
    content: htmlParser('<h2>New heading</h2>')
      .children[0] as RaisinElementNode,
  },
  {
    title: 'Table',
    content: htmlParser(
      '<table><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table>'
    ).children[0] as RaisinElementNode,
  },
];

/**
 * A single draggable block in the sidebar.
 */
function DraggableBlockItem({ block }: { block: Block }) {
  const { draggable, onDragStart, onDragEnd, isDragging } =
    useDragBlock(block);

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={isDragging ? BlockItemDragging : BlockItem}
    >
      {block.title}
    </div>
  );
}

/**
 * Sidebar listing all available blocks that can be dragged.
 */
function DragBlocksSidebar() {
  const { ComponentModelAtom } = useMolecule(ComponentModelMolecule);

  const { blocks } = useAtomValue(ComponentModelAtom);

  const allBlocks = blocks.length ? blocks : fakeBlocks;

  // Group blocks by their component tag or example group
  const grouped = allBlocks.reduce(
    (acc, block) => {
      const group = block.exampleGroup || block.componentTag || 'Components';
      if (!acc[group]) acc[group] = [];
      acc[group].push(block);
      return acc;
    },
    {} as Record<string, Block[]>
  );

  return (
    <div style={SidebarStyle}>
      <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
        Components
      </div>
      <div
        style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}
      >
        Drag a component to add it to the editor
      </div>
      {Object.entries(grouped).map(([group, groupBlocks]) => (
        <div key={group}>
          <div style={SectionTitle}>{group}</div>
          {groupBlocks.map((block, i) => (
            <DraggableBlockItem key={`${block.title}-${i}`} block={block} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * A drop target component for the layers panel that visually expands on hover.
 */
function DragDropTarget({ idx, slot }: { idx: number; slot: string }) {
  const { isDroppable, isOver, dropTargetProps } = useDropTarget({ idx, slot });

  if (!isDroppable) {
    return <></>;
  }

  return (
    <div
      {...dropTargetProps}
      style={isOver ? DropZoneHover : DropZone}
      data-raisins-drop-target
    >
      {isOver ? `Drop here` : `Position ${idx}`}
    </div>
  );
}

// -- Layers with Drag and Drop --

function DragDropLayersController() {
  const { RootNodeAtom } = useMolecule(CoreMolecule);

  const rootNode = useAtomValue(RootNodeAtom) as RaisinDocumentNode;
  const hasChildren = rootNode.children.length > 0;

  return (
    <div>
      <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
        Layers
      </div>
      <NodeScopeProvider nodeAtom={RootNodeAtom}>
        {hasChildren && (
          <SlotScopeProvider slot="">
            <NodeChildrenEditor Component={DragDropElementLayer} />
          </SlotScopeProvider>
        )}
      </NodeScopeProvider>
    </div>
  );
}

function DragDropElementLayer() {
  const {
    isNodeAnElement,
    isNodePicked,
    isSelectedForNode,
    nameForNode,
    nodeHovered,
    removeForNode,
    setSelectedForNode,
    allSlotsForNode,
    duplicateForNode,
  } = useMolecule(NodeMolecule);

  const { PloppingIsActive } = useMolecule(PickAndPlopMolecule);
  const { DraggingIsActive } = useMolecule(DragAndDropMolecule);

  const setSelected = useSetAtom(setSelectedForNode);
  const isAnElement = useAtomValue(isNodeAnElement);
  const isSelected = useAtomValue(isSelectedForNode);
  const isPicked = useAtomValue(isNodePicked);
  const [isHovered, setHovered] = useAtom(nodeHovered);
  const slots = useAtomValue(allSlotsForNode);
  const removeNode = useSetAtom(removeForNode);
  const duplicate = useSetAtom(duplicateForNode);
  const title = useAtomValue(nameForNode);
  const isPlopping = useAtomValue(PloppingIsActive);
  const isDragging = useAtomValue(DraggingIsActive);

  if (!isAnElement) return <></>;

  const isActive = isPlopping || isDragging;

  const style = {
    ...LayerItem,
    ...(isSelected ? LayerItemSelected : {}),
    ...(isHovered && !isSelected ? LayerItemHovered : {}),
  };

  const hasSlots = slots?.length > 0;

  return (
    <div style={style}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onClick={setSelected}
        onMouseOver={setHovered}
      >
        <span style={{ fontWeight: isSelected ? 600 : 400 }}>
          {title}
          {isPicked && (
            <span style={{ color: '#1976d2', marginLeft: '4px' }}>
              (moving)
            </span>
          )}
        </span>
        <span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              duplicate();
            }}
            disabled={isActive}
            style={{ fontSize: '10px', marginRight: '2px' }}
          >
            ⊕
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeNode();
            }}
            disabled={isActive}
            style={{ fontSize: '10px' }}
          >
            ✕
          </button>
        </span>
      </div>
      {hasSlots && (
        <div style={SlotContainer}>
          <SlotChildrenController Component={DragDropSlotWidget} />
        </div>
      )}
    </div>
  );
}

function DragDropSlotWidget() {
  const atoms = useMolecule(SlotMolecule);
  const childNodes = useAtomValue(atoms.childrenInSlot);
  const slotDetails = useAtomValue(atoms.slotDetails);
  const slotWidget = slotDetails.editor;
  const hasEditor = slotWidget === 'inline';
  const isEmpty = (childNodes?.length ?? 0) <= 0;

  if (hasEditor) {
    return (
      <div>
        <div style={SlotLabel}>
          {slotDetails.title ?? slotDetails.name} ({childNodes.length})
        </div>
        <NodeRichTextController />
      </div>
    );
  }

  return (
    <div>
      <div style={SlotLabel}>
        {slotDetails.title ?? slotDetails.name} ({childNodes.length})
      </div>
      <div>
        <DragDropTarget idx={0} slot={slotDetails.name} />
        {!isEmpty && (
          <ChildrenEditorForAtoms
            childAtoms={childNodes}
            Component={({ idx }) => (
              <DragDropSlotChild idx={idx} slotName={atoms.slotName} />
            )}
          />
        )}
      </div>
    </div>
  );
}

const DragDropSlotChild: React.FC<{ idx?: number; slotName: string }> = ({
  idx,
  slotName,
}) => {
  return (
    <>
      <DragDropElementLayer />
      <DragDropTarget idx={(idx ?? 0) + 1} slot={slotName} />
    </>
  );
};

// -- Canvas with pick-and-plop support --

function DragDropCanvas() {
  useMolecule(CanvasSelectionMolecule);
  useMolecule(CanvasHoveredMolecule);
  useMolecule(CanvasPickAndPlopMolecule);
  useMolecule(CanvasDragAndDropMolecule);
  return (
    <CanvasDragDropWrapper>
      <BasicCanvasController />
    </CanvasDragDropWrapper>
  );
}

// -- Editor composition --

function DragDropEditor() {
  useHotkeys();

  return (
    <div style={EditorContainer}>
      <DragBlocksSidebar />
      <div style={CanvasArea}>
        <CanvasProvider>
          <DragDropCanvas />
        </CanvasProvider>
      </div>
      <div style={PropertiesPanel}>
        <div
          style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}
        >
          Properties
        </div>
        <SelectedNodeController
          HasSelectionComponent={AttributesController}
        />
        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '16px 0' }} />
        <DragDropLayersController />
      </div>
    </div>
  );
}

// -- Stories --

const startingHtml = `
<div>
  <h1>My Heading</h1>
  <p style="width:200px;height:100px;">My first paragraph</p>
  <p style="width:200px;height:100px;">My second paragraph</p>
</div>
`;

export function DragAndDropBasic() {
  return (
    <BasicStory startingHtml={startingHtml}>
      <DragDropEditor />
    </BasicStory>
  );
}
DragAndDropBasic.storyName = 'Basic HTML';

export function DragAndDropMint() {
  return (
    <BasicStory startingHtml={mintMono} startingPackages={MintComponents}>
      <DragDropEditor />
    </BasicStory>
  );
}
DragAndDropMint.storyName = 'Mint Components';

export function DragAndDropVanilla() {
  return (
    <BasicStory
      startingHtml={referrerWidget}
      startingPackages={VanillaComponents}
    >
      <DragDropEditor />
    </BasicStory>
  );
}
DragAndDropVanilla.storyName = 'Vanilla Components';

export function DragAndDropBig() {
  return (
    <BasicStory startingHtml={big}>
      <DragDropEditor />
    </BasicStory>
  );
}
DragAndDropBig.storyName = 'Big Document';
