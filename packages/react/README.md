# Raisins React

Raisins in a WYSIWYG visual editor for HTML and web components. This is the react package, which handles the state behind the visual rendering experience.

# Installation

```
npm i @raisins/react
```

# Examples

Raisins React comes with many controllers and molecules to help build a visual editor for your HTML. By using each of them together, you are able to control each different piece of functionality to include or exclude from the editing experience.

## Base Example

- The base example contains a canvas with some basic text editability. It can be combined with the examples below to provide a more complete editability experience.

```js
  const WidgetScope = createScope<{
    startingHtml: string;
    startingPackages: Module[];
  }>({
    startingHtml: '',
    startingPackages: [] as Module[],
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
    <h1>My Heading</h1>
    <p style="width:200px;height:100px;">My first paragraph</p>
    <p style="width:200px;height:100px;">My second paragraph</p>
`;

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
```

## External HTML Control

```js
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

```

## Canvas Toolbars

```js
const ToolbarMolecule = molecule((getMol) => {
  return {
    ...getMol(HoveredNodeMolecule),
    ...getMol(SelectedNodeMolecule),
    ...getMol(HistoryMolecule),
    ...getMol(CanvasStyleMolecule),
    ...getMol(CanvasSelectionMolecule),
    ...getMol(CanvasHoveredMolecule),
    ...getMol(ComponentModelMolecule),
  };
});

const Toolbars = () => {
  const {
    HoveredNodeAtom,
    SelectedNodeAtom,
    SelectedRectAtom,
    HoveredRectAtom,
    ComponentModelAtom,
  } = useMolecule(ToolbarMolecule);

  const hoveredNode = useAtomValue(HoveredNodeAtom) as RaisinElementNode;
  const selectedNode = useAtomValue(SelectedNodeAtom) as RaisinElementNode;

  const { getComponentMeta } = useAtomValue(ComponentModelAtom);
  const hoveredTitle = getComponentMeta(hoveredNode?.tagName).title;
  const selectedTitle = getComponentMeta(selectedNode?.tagName).title;
  return (
    <>
      <PositionedToolbar rectAtom={HoveredRectAtom}>
        Hovered - {hoveredTitle}
      </PositionedToolbar>
      <PositionedToolbar rectAtom={SelectedRectAtom}>
        Selected - {selectedTitle}
        <SelectedNodeRichTextEditor />
      </PositionedToolbar>
    </>
  );
};

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
```

## Layers

```js
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
```

```js
type Atoms = {
  slot: string,
  slotDetails: Atom<Slot>,
  slotName: string,
  childrenInSlot: WritableAtom<
    PrimitiveAtom<RaisinNode>[],
    PrimitiveAtom<RaisinNode>,
    void
  >,
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
function ElementLayer() {
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
              <SlotChildrenController Component={SlotWidget} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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

const SlotChild: React.FC<{ idx?: number, atoms: Atoms }> = ({
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
```

## Layers With Buttons

```js
type Atoms = {
  slot: string,
  slotDetails: Atom<Slot>,
  slotName: string,
  childrenInSlot: WritableAtom<
    PrimitiveAtom<RaisinNode>[],
    PrimitiveAtom<RaisinNode>,
    void
  >,
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

const SlotChild: React.FC<{ idx?: number, atoms: Atoms }> = ({
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
function PlopTarget({ idx, slot }: { idx: number, slot: string }) {
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
```

## Custom Components

```js
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

export function CustomComponents() {
  return (
    <ScopeProvider
      scope={WidgetScope}
      value={{
        startingHtml: html,
        startingPackages: [
          {
            package: '@saasquatch/mint-components',
            version: '1.6.x',
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
```

## Full Example

```js
// Config
// ...WidgetScope, ConfigMolecule

// Layers
// ...ElementLayer, SlotWidget, SlotChild, PlopTarget

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

export function FullExample() {
  return (
    <ScopeProvider
      scope={WidgetScope}
      value={{
        startingHtml: html,
        startingPackages: [
          {
            package: '@saasquatch/mint-components',
            version: '1.6.x',
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
```
