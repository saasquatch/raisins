import {
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNode,
} from '@raisins/core';
import { Meta } from '@storybook/react';
import {
  useAtomValue,
  atom,
  Atom,
  useSetAtom,
  useAtom,
  WritableAtom,
  PrimitiveAtom,
} from 'jotai';
import {
  createScope,
  molecule,
  ScopeProvider,
  useMolecule,
} from 'jotai-molecules';
import React, { CSSProperties, FC, useCallback, useMemo } from 'react';
import { AttributesController } from '../attributes';
import {
  CanvasSelectionMolecule,
  CanvasHoveredMolecule,
  BasicCanvasController,
  CanvasProvider,
  Rect,
  CanvasPickAndPlopMolecule,
} from '../canvas';
import { ComponentModelMolecule, Module } from '../component-metamodel';
import { Slot } from '../component-metamodel/Component';
import {
  HoveredNodeMolecule,
  SelectedNodeMolecule,
  HistoryMolecule,
  RaisinConfig,
  SelectedNodeController,
  RaisinsProvider,
  EditSelectedMolecule,
  EditMolecule,
  CoreMolecule,
  PickAndPlopMolecule,
} from '../core';
import { useHotkeys } from '../hotkeys';
import {
  ChildrenEditorForAtoms,
  NodeChildrenEditor,
  NodeMolecule,
  NodeScopeProvider,
  SlotChildrenController,
  SlotMolecule,
  SlotScopeProvider,
} from '../node';
import {
  ProseEditor,
  ProseEditorScopeProvider,
  RichTextMolecule,
} from '../rich-text';
import { NodeRichTextController } from '../rich-text/RichTextEditor';

const meta: Meta = {
  title: 'Examples',
  excludeStories: ['EditorView', 'StoryConfigMolecule', 'ErrorListController'],
};
export default meta;

const WidgetScope = createScope<{
  startingHtml: string;
  startingPackages: Module[];
}>({
  startingHtml: '',
  startingPackages: [{ package: '', version: '' }] as Module[],
});

const ConfigMolecule = molecule<Partial<RaisinConfig>>((_, getScope) => {
  const widgetScope = getScope(WidgetScope);
  return {
    HTMLAtom: atom(widgetScope.startingHtml),
    PackagesAtom: atom(widgetScope.startingPackages),
    uiWidgetsAtom: atom({}),
  };
});

const startingHtml = `
<div>
  <h1>My Heading</h1>
  <p style="width:200px;height:100px;">My first paragraph</p>
  <p style="width:200px;height:100px;">My second paragraph</p>
</div>
`;

const AttributeEditor = () => {
  useMolecule(CanvasSelectionMolecule);
  useMolecule(CanvasHoveredMolecule);
  return (
    <SelectedNodeController
      HasSelectionComponent={AttributesController}
    ></SelectedNodeController>
  );
};

export function BaseExample() {
  const Editor = () => {
    useHotkeys();
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 0.7 }}>
          <BasicCanvasController />
        </div>
        <div style={{ flex: 0.3 }}>
          <AttributeEditor />
        </div>
      </div>
    );
  };

  return (
    <ScopeProvider
      scope={WidgetScope}
      value={{
        startingHtml,
        startingPackages: [],
      }}
    >
      <RaisinsProvider molecule={ConfigMolecule}>
        <CanvasProvider>
          <Editor />
        </CanvasProvider>
      </RaisinsProvider>
    </ScopeProvider>
  );
}

export function ExternalHTMLControl() {
  const Editor = () => {
    useHotkeys();
    const { HTMLAtom } = useMolecule(ConfigMolecule);
    const [html, setHtml] = useAtom(HTMLAtom!);

    return (
      <>
        <textarea
          value={html}
          onInput={(e) => setHtml((e.target as HTMLTextAreaElement).value)}
          rows={10}
          style={{ width: '500px' }}
        />
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 0.7 }}>
            <BasicCanvasController />
          </div>
          <div style={{ flex: 0.3 }}>
            <AttributeEditor />
          </div>
        </div>
      </>
    );
  };

  return (
    <ScopeProvider
      scope={WidgetScope}
      value={{
        startingHtml,
        startingPackages: [],
      }}
    >
      <RaisinsProvider molecule={ConfigMolecule}>
        <CanvasProvider>
          <Editor />
        </CanvasProvider>
      </RaisinsProvider>
    </ScopeProvider>
  );
}

export function WithToolbars() {
  const Editor = () => {
    useHotkeys();
    const { EditSelectedNodeAtom } = useMolecule(EditSelectedMolecule);
    return (
      <>
        <NodeScopeProvider nodeAtom={EditSelectedNodeAtom}>
          <Toolbars />
        </NodeScopeProvider>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 0.7 }}>
            <BasicCanvasController />
          </div>
          <div style={{ flex: 0.3 }}>
            <AttributeEditor />
          </div>
        </div>
      </>
    );
  };

  return (
    <ScopeProvider
      scope={WidgetScope}
      value={{
        startingHtml,
        startingPackages: [],
      }}
    >
      <RaisinsProvider molecule={ConfigMolecule}>
        <CanvasProvider>
          <Editor />
        </CanvasProvider>
      </RaisinsProvider>
    </ScopeProvider>
  );
}

export function WithLayers() {
  const Editor = () => {
    useHotkeys();
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 0.3 }}>
          <LayersControllerSimple />
        </div>
        <div style={{ flex: 0.4 }}>
          <BasicCanvasController />
        </div>
        <div style={{ flex: 0.3 }}>
          <AttributeEditor />
        </div>
      </div>
    );
  };

  return (
    <ScopeProvider
      scope={WidgetScope}
      value={{
        startingHtml,
        startingPackages: [],
      }}
    >
      <RaisinsProvider molecule={ConfigMolecule}>
        <CanvasProvider>
          <Editor />
        </CanvasProvider>
      </RaisinsProvider>
    </ScopeProvider>
  );
}

export function WithLayersAndButtons() {
  const Editor = () => {
    useHotkeys();
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 0.3 }}>
          <LayersController />
        </div>
        <div style={{ flex: 0.4 }}>
          <BasicCanvasController />
        </div>
        <div style={{ flex: 0.3 }}>
          <AttributeEditor />
        </div>
      </div>
    );
  };

  return (
    <ScopeProvider
      scope={WidgetScope}
      value={{
        startingHtml,
        startingPackages: [],
      }}
    >
      <RaisinsProvider molecule={ConfigMolecule}>
        <CanvasProvider>
          <Editor />
        </CanvasProvider>
      </RaisinsProvider>
    </ScopeProvider>
  );
}

export function WithMintComponents() {
  const Editor = () => {
    useHotkeys();
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 0.3 }}>
          <LayersController />
        </div>
        <div style={{ flex: 0.4 }}>
          <BasicCanvasController />
        </div>
        <div style={{ flex: 0.3 }}>
          <AttributeEditor />
        </div>
      </div>
    );
  };

  const html =
    startingHtml +
    `<sqm-timeline icon="circle">
  <sqm-timeline-entry reward="$50" unit="visa giftcard" desc="Your friend purchases a Business plan" icon="circle">
  </sqm-timeline-entry>
  <sqm-timeline-entry reward="$200" unit="visa giftcard" desc="Our sales team qualifies your friend as a good fit for our Enterprise plan" icon="circle">
  </sqm-timeline-entry>
  <sqm-timeline-entry reward="$1000" unit="visa giftcard" desc="Your friend purchases an Enterprise plan" icon="circle">
  </sqm-timeline-entry></sqm-timeline>`;

  return (
    <ScopeProvider
      scope={WidgetScope}
      value={{
        startingHtml: html,
        startingPackages: [
          {
            package: '@saasquatch/mint-components',
            version: 'next',
          },
        ],
      }}
    >
      <RaisinsProvider molecule={ConfigMolecule}>
        <CanvasProvider>
          <Editor />
        </CanvasProvider>
      </RaisinsProvider>
    </ScopeProvider>
  );
}

export function FullExample() {
  const Editor = () => {
    useHotkeys();
    const { EditSelectedNodeAtom } = useMolecule(EditSelectedMolecule);
    const { HTMLAtom } = useMolecule(ConfigMolecule);
    const [html, setHtml] = useAtom(HTMLAtom!);

    return (
      <>
        <textarea
          value={html}
          onInput={(e) => setHtml((e.target as HTMLTextAreaElement).value)}
          rows={10}
          style={{ width: '500px' }}
        />
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 0.3 }}>
            <LayersController />
          </div>
          <div style={{ flex: 0.4 }}>
            <NodeScopeProvider nodeAtom={EditSelectedNodeAtom}>
              <Toolbars />
            </NodeScopeProvider>
            <BasicCanvasController />
          </div>
          <div style={{ flex: 0.3 }}>
            <AttributeEditor />
          </div>
        </div>
      </>
    );
  };

  const AttributeEditor = () => {
    useMolecule(CanvasSelectionMolecule);
    useMolecule(CanvasHoveredMolecule);
    useMolecule(CanvasPickAndPlopMolecule);
    return (
      <SelectedNodeController
        HasSelectionComponent={AttributesController}
      ></SelectedNodeController>
    );
  };

  const html =
    startingHtml +
    `<sqm-timeline icon="circle">
<sqm-timeline-entry reward="$50" unit="visa giftcard" desc="Your friend purchases a Business plan" icon="circle">
</sqm-timeline-entry>
<sqm-timeline-entry reward="$200" unit="visa giftcard" desc="Our sales team qualifies your friend as a good fit for our Enterprise plan" icon="circle">
</sqm-timeline-entry>
<sqm-timeline-entry reward="$1000" unit="visa giftcard" desc="Your friend purchases an Enterprise plan" icon="circle">
</sqm-timeline-entry></sqm-timeline>`;

  return (
    <ScopeProvider
      scope={WidgetScope}
      value={{
        startingHtml: html,
        startingPackages: [
          {
            package: '@saasquatch/mint-components',
            version: 'next',
          },
        ],
      }}
    >
      <RaisinsProvider molecule={ConfigMolecule}>
        <CanvasProvider>
          <Editor />
        </CanvasProvider>
      </RaisinsProvider>
    </ScopeProvider>
  );
}

const ToolbarMolecule = molecule((getMol) => {
  return {
    ...getMol(HoveredNodeMolecule),
    ...getMol(SelectedNodeMolecule),
    ...getMol(HistoryMolecule),
    ...getMol(CanvasSelectionMolecule),
    ...getMol(CanvasHoveredMolecule),
    ...getMol(ComponentModelMolecule),
    ...getMol(RichTextMolecule),
  };
});

const Toolbars = () => {
  const {
    HoveredNodeAtom,
    SelectedNodeAtom,
    SelectedRectAtom,
    HoveredRectAtom,
    ComponentModelAtom,

    proseAtom,
  } = useMolecule(ToolbarMolecule);

  const hoveredNode = useAtomValue(HoveredNodeAtom) as RaisinElementNode;
  const selectedNode = useAtomValue(SelectedNodeAtom) as RaisinElementNode;

  const { getComponentMeta } = useAtomValue(ComponentModelAtom);
  const hoveredMeta = getComponentMeta(hoveredNode?.tagName);
  const selectedMeta = getComponentMeta(selectedNode?.tagName);
  const textEditor = selectedMeta.slotEditor === 'richText';
  return (
    <>
      <PositionedToolbar rectAtom={HoveredRectAtom}>
        Hovered - {hoveredMeta?.title}
      </PositionedToolbar>
      <PositionedToolbar rectAtom={SelectedRectAtom}>
        Selected - {selectedMeta?.title}
        {textEditor && (
          <ProseEditorScopeProvider value={proseAtom}>
            <ProseEditor />
          </ProseEditorScopeProvider>
        )}
      </PositionedToolbar>
    </>
  );
};

const PositionedToolbar = ({
  rectAtom,
  children,
}: {
  rectAtom: Atom<Rect | undefined>;
  children: React.ReactNode;
}) => {
  const rect = useAtomValue(rectAtom);
  if (!rect)
    return (
      <div style={{ position: 'absolute', top: 0, left: 0, display: 'none' }} />
    );

  const { x, y, width, height } = rect;

  console.log(x, y, width, height);
  const toolbarWidth = width + 4;
  return (
    <div
      style={{
        background: 'green',
        color: 'white',
        position: 'absolute',
        transform: `translate(${x - 2}px, ${y + height}px)`,
        transition: 'transform .2s',
        width: toolbarWidth + 'px',
        minWidth: '200px',
      }}
    >
      {children}
    </div>
  );
};

const LayersMolecule = molecule((getMol) => {
  const { InsertNodeAtom } = getMol(EditMolecule);
  const { ComponentModelAtom } = getMol(ComponentModelMolecule);
  const { RootNodeAtom } = getMol(CoreMolecule);
  const RootHasChildren = atom(
    (get) => (get(RootNodeAtom) as RaisinDocumentNode).children.length > 0
  );

  return {
    ...getMol(PickAndPlopMolecule),
    InsertNodeAtom,
    ComponentModelAtom,
    RootHasChildren,
    RootNodeAtom,
  };
});

const LayersControllerSimple = () => {
  const atoms = useMolecule(LayersMolecule);
  const hasChildren = useAtomValue(atoms.RootHasChildren);

  return (
    <NodeScopeProvider nodeAtom={atoms.RootNodeAtom}>
      {hasChildren && (
        <SlotScopeProvider slot="">
          <NodeChildrenEditor Component={ElementLayerName} />
        </SlotScopeProvider>
      )}
    </NodeScopeProvider>
  );
};

const LayersController = () => {
  const atoms = useMolecule(LayersMolecule);
  const hasChildren = useAtomValue(atoms.RootHasChildren);

  return (
    <NodeScopeProvider nodeAtom={atoms.RootNodeAtom}>
      {hasChildren && (
        <SlotScopeProvider slot="">
          <NodeChildrenEditor Component={ElementLayer} />
        </SlotScopeProvider>
      )}
    </NodeScopeProvider>
  );
};

const Label: CSSProperties = {
  cursor: 'pointer',
  lineHeight: '28px',
};

const Layer: CSSProperties = {
  position: 'relative',
  userSelect: 'none',
  cursor: 'pointer',
  padding: '10px 0',
  outlineOffset: '-2px',
};

const SelectedLayer: CSSProperties = {
  background: 'green',
};

const SlotContainer: CSSProperties = {
  marginLeft: '3px',
  display: 'flex',
  padding: '0 0 3px 0',
};

const SlotName: CSSProperties = {
  writingMode: 'vertical-lr',
  textOrientation: 'sideways',
  fontSize: '0.7em',
  padding: '5px 0 5px 2px',
  color: 'grey',
  background: 'rgba(0, 0, 0, 0.1)',
};

const SlotChildren: CSSProperties = {
  width: '100%',
};
const TitleBar: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
};

function ElementLayerName() {
  const {
    isNodeAnElement,
    isSelectedForNode,
    nameForNode,
    nodeHovered,
    setSelectedForNode,
    allSlotsForNode,
  } = useMolecule(NodeMolecule);

  const setSelected = useSetAtom(setSelectedForNode);
  const isAnElement = useAtomValue(isNodeAnElement);
  const isSelected = useAtomValue(isSelectedForNode);
  const [isHovered, setHovered] = useAtom(nodeHovered);
  const slots = useAtomValue(allSlotsForNode);
  const title = useAtomValue(nameForNode);
  // Don't render non-element layers
  if (!isAnElement) return <></>;

  const name = (
    <div style={TitleBar} onClick={setSelected} onMouseOver={setHovered}>
      <div style={Label}>{title}</div>
    </div>
  );

  const hasSlots = slots?.length > 0;
  const style = {
    ...Layer,
    ...(isSelected ? SelectedLayer : {}),
    ...(isHovered ? { outline: '1px dashed green' } : {}),
  };

  return (
    <div data-element style={style}>
      {!hasSlots && name}
      {hasSlots && (
        <div>
          {name}
          {hasSlots && (
            <div>
              <SlotChildrenController Component={SlotWidgetSimple} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SlotWidgetSimple() {
  const atoms = useMolecule(SlotMolecule);
  const childNodes = useAtomValue(atoms.childrenInSlot);

  const slotDetails = useAtomValue(atoms.slotDetails);
  const slotWidget = slotDetails.editor;
  const hasEditor = slotWidget === 'inline';
  const isEmpty = (childNodes?.length ?? 0) <= 0;

  return (
    <>
      <div style={SlotContainer}>
        <div style={SlotName}>
          {slotDetails.title ?? slotDetails.name} ({childNodes.length})
        </div>
        {hasEditor && <NodeRichTextController />}
        {!hasEditor && (
          // Block Editor
          <>
            {!isEmpty && (
              <div style={SlotChildren}>
                <PlopTarget idx={0} slot={slotDetails.name} />
                <ChildrenEditorForAtoms
                  childAtoms={childNodes}
                  Component={({ idx }) => (
                    <SlotChildSimple idx={idx} atoms={atoms} />
                  )}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

const SlotChildSimple: React.FC<{ idx?: number; atoms: Atoms }> = ({
  idx,
  atoms,
}) => {
  return (
    <>
      <ElementLayerName />
      <PlopTarget idx={idx ?? 0} slot={atoms.slotName} />
    </>
  );
};

function ElementLayer() {
  const {
    duplicateForNode,
    isNodeAnElement,
    isNodePicked,
    isSelectedForNode,
    nameForNode,
    nodeHovered,
    removeForNode,
    setSelectedForNode,
    allSlotsForNode,
    togglePickNode,
  } = useMolecule(NodeMolecule);

  const atoms = useMolecule(LayersMolecule);
  const setSelected = useSetAtom(setSelectedForNode);
  const isAnElement = useAtomValue(isNodeAnElement);
  const isSelected = useAtomValue(isSelectedForNode);
  const isPicked = useAtomValue(isNodePicked);
  const [isHovered, setHovered] = useAtom(nodeHovered);
  const slots = useAtomValue(allSlotsForNode);

  const removeNode = useSetAtom(removeForNode);
  const duplicate = useSetAtom(duplicateForNode);
  const title = useAtomValue(nameForNode);
  const moveNode = useSetAtom(togglePickNode);
  const isPlopping = useAtomValue(atoms.PloppingIsActive);
  const canMove = isPicked || !isPlopping;
  // Don't render non-element layers
  if (!isAnElement) return <></>;

  const name = (
    <div style={TitleBar} onClick={setSelected} onMouseOver={setHovered}>
      <div style={Label}>
        {title} {isPicked && ' Moving...'}
      </div>
      <div>
        <button onClick={moveNode} disabled={!canMove}>
          {isPicked ? 'Cancel move' : 'Move'}
        </button>
        <button onClick={duplicate} disabled={isPlopping}>
          Dupe
        </button>
        <button onClick={removeNode} disabled={isPlopping}>
          Delete
        </button>
      </div>
    </div>
  );

  const hasSlots = slots?.length > 0;
  const style = {
    ...Layer,
    ...(isSelected ? SelectedLayer : {}),
    ...(isHovered ? { outline: '1px dashed green' } : {}),
  };

  return (
    <div data-element style={style}>
      {!hasSlots && name}
      {hasSlots && (
        <div>
          {name}
          {hasSlots && (
            <div>
              <SlotChildrenController Component={SlotWidget} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type Atoms = {
  slot: string;
  slotDetails: Atom<Slot>;
  slotName: string;
  childrenInSlot: WritableAtom<
    PrimitiveAtom<RaisinNode>[],
    PrimitiveAtom<RaisinNode>,
    void
  >;
};

function SlotWidget() {
  const atoms = useMolecule(SlotMolecule);
  const childNodes = useAtomValue(atoms.childrenInSlot);

  const slotDetails = useAtomValue(atoms.slotDetails);
  const slotWidget = slotDetails.editor;
  const hasEditor = slotWidget === 'inline';
  const isEmpty = (childNodes?.length ?? 0) <= 0;

  return (
    <>
      <div style={SlotContainer}>
        <div style={SlotName}>
          {slotDetails.title ?? slotDetails.name} ({childNodes.length})
        </div>
        {hasEditor && <NodeRichTextController />}
        {!hasEditor && (
          // Block Editor
          <>
            {!isEmpty && (
              <div style={SlotChildren}>
                <PlopTarget idx={0} slot={slotDetails.name} />
                <ChildrenEditorForAtoms
                  childAtoms={childNodes}
                  Component={({ idx }) => <SlotChild idx={idx} atoms={atoms} />}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

const SlotChild: React.FC<{ idx?: number; atoms: Atoms }> = ({
  idx,
  atoms,
}) => {
  return (
    <>
      <ElementLayer />
      <PlopTarget idx={idx ?? 0} slot={atoms.slotName} />
    </>
  );
};
function PlopTarget({ idx, slot }: { idx: number; slot: string }) {
  const { canPlopHereAtom, plopNodeHere } = useMolecule(NodeMolecule);
  const canPlop = useAtomValue(canPlopHereAtom);
  const plopNode = useSetAtom(plopNodeHere);
  const plop = useCallback(() => plopNode({ idx, slot }), [idx, slot]);

  const isPloppable = canPlop({ slot, idx });
  if (!isPloppable) {
    return <></>;
  }
  return (
    <div style={{ border: '1px dashed red' }}>
      Position {idx} in {slot || 'content'}
      <button onClick={plop}>Plop</button>
    </div>
  );
}
