import {
  htmlUtil,
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { Slot } from '@raisins/schema/schema';
import { atom, useAtom, useSetAtom } from 'jotai';
import { molecule, useMolecule } from 'jotai-molecules';
import { focusAtom } from 'jotai/optics';
import { splitAtom, useAtomValue } from 'jotai/utils';
import { optic_ } from 'optics-ts';
import React, {
  CSSProperties,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { ComponentModelMolecule } from '../component-metamodel/ComponentModel';
import { CoreMolecule } from '../core/CoreAtoms';
import { EditMolecule } from '../core/editting/EditAtoms';
import { RaisinScope } from '../core/RaisinScope';
import { PickedNodeMolecule } from '../core/selection/PickedNode';
import {
  ChildrenEditor,
  ChildrenEditorForAtoms,
} from '../node/children/ChildrenEditor';
import { NodeMolecule } from '../node/NodeMolecule';
import { NodeAtomProvider, useNodeAtom } from '../node/NodeScope';
import { RichTextEditorForAtom } from '../rich-text/RichTextEditor';
import { isElementNode } from '../util/isNode';
const { clone } = htmlUtil;

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

const AddBlock: CSSProperties = {
  flex: '1',
  width: '100%',
  justifySelf: 'stretch',
  alignSelf: 'stretch',
  background: 'rgba(0, 0, 255, 0.1)',
  color: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const LayersController: FC<{}> = () => {
  const atoms = useMolecule(LayersMolecule);
  const hasChildren = useAtomValue(atoms.RootHasChildren, RaisinScope);

  return (
    <div data-layers>
      {' '}
      Don't re-render unless number of children changes!
      <div data-layers-root>
        <NodeAtomProvider nodeAtom={atoms.RootNodeAtom}>
          {hasChildren && <ChildrenEditor Component={ElementLayer} />}
          {!hasChildren && <AddNew idx={0} />}
        </NodeAtomProvider>
      </div>
    </div>
  );
};

function AddNew(props: { idx: number; slot?: string }) {
  const atoms = useMolecule(LayersMolecule);
  const node = useAtomValue(useNodeAtom(), RaisinScope);
  const insert = useSetAtom(atoms.InsertNodeAtom, RaisinScope);
  const comp = useAtomValue(atoms.ComponentModelAtom, RaisinScope);

  const [open, setOpen] = useState(false);
  const validChildren = comp.getValidChildren(node, props.slot);
  if (validChildren.length <= 0) {
    return <></>;
  }
  return (
    <>
      {!open && (
        <div style={AddBlock} onClick={() => setOpen(true)}>
          <div>Insert</div>
        </div>
      )}
      {open && (
        <div style={{ display: 'flex', overflowX: 'auto' }}>
          {validChildren.map((b) => {
            const meta = comp.getComponentMeta(b.content.tagName);
            return (
              <button
                onClick={() => {
                  const cloned = clone(b.content) as RaisinElementNode;
                  // TODO: add "insert into slot" into core model?
                  props.slot && (cloned.attribs.slot = props.slot);
                  insert({
                    node: cloned,
                    parent: node as RaisinElementNode,
                    idx: props.idx,
                  });
                }}
              >
                {meta.title}
                <br />
                <small>{b.title}</small>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

const LayersMolecule = molecule((getMol) => {
  const { InsertNodeAtom } = getMol(EditMolecule);
  const { ComponentModelAtom } = getMol(ComponentModelMolecule);
  const { RootNodeAtom } = getMol(CoreMolecule);
  const RootHasChildren = atom(
    (get) => (get(RootNodeAtom) as RaisinDocumentNode).children.length > 0
  );

  return {
    ...getMol(PickedNodeMolecule),
    InsertNodeAtom,
    ComponentModelAtom,
    RootHasChildren,
    RootNodeAtom,
  };
});

function ElementLayer() {
  const {
    duplicateForNode,
    isNodeAnElement,
    isNodePicked,
    isSelectedForNode,
    nameForNode,
    nodeHovered,
    nodeSoul,
    removeForNode,
    setSelectedForNode,
    slotsForNode,
    togglePickNode,
  } = useMolecule(NodeMolecule);
  const atoms = useMolecule(LayersMolecule);
  const setSelected = useSetAtom(setSelectedForNode, RaisinScope);
  const isAnElement = useAtomValue(isNodeAnElement, RaisinScope);
  const isSelected = useAtomValue(isSelectedForNode, RaisinScope);
  const isPicked = useAtomValue(isNodePicked, RaisinScope);
  const [isHovered, setHovered] = useAtom(nodeHovered, RaisinScope);
  const nodeWithSlots = useAtomValue(slotsForNode, RaisinScope);

  const removeNode = useSetAtom(removeForNode, RaisinScope);
  const duplicate = useSetAtom(duplicateForNode, RaisinScope);
  const title = useAtomValue(nameForNode, RaisinScope);
  const moveNode = useSetAtom(togglePickNode, RaisinScope);
  const soul = useAtomValue(nodeSoul, RaisinScope);

  const isPlopping = useAtomValue(atoms.PloppingIsActive, RaisinScope);
  const canMove = isPicked || !isPlopping;
  // Don't render non-element layers
  if (!isAnElement) return <></>;

  const name = (
    <div style={TitleBar} onClick={setSelected} onMouseOver={setHovered}>
      <div style={Label}>
        {title} {isPicked && ' Moving...'} {soul.toString()}
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
  // const hasChildren = children?.length > 0;

  const slots = nodeWithSlots ?? [];
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
              {slots.map((s) => (
                <SlotWidget s={s} key={s.name} />
              ))}
            </div>
          )}{' '}
        </div>
      )}
    </div>
  );
}

function SlotWidget({ s }: { s: Slot }) {
  const childNodes = useSlotChildNodes(s.name);

  const slotWidget = s.editor;
  const hasEditor = slotWidget === 'inline';
  const isEmpty = (childNodes?.length ?? 0) <= 0;

  return (
    <>
      <div style={SlotContainer}>
        <div style={SlotName}>
          {s.title ?? s.name} ({childNodes.length})
        </div>
        {hasEditor && (
          // Rich Text Editor<>
          <RichTextEditorForAtom />
        )}
        {!hasEditor && (
          // Block Editor
          <>
            {isEmpty && <AddNew idx={childNodes?.length ?? 0} slot={s.name} />}
            {!isEmpty && (
              <div style={SlotChildren}>
                <PlopTarget idx={0} slot={s.name} />
                <SlotContext.Provider value={s.name}>
                  <ChildrenEditorForAtoms
                    childAtoms={childNodes}
                    Component={SlotChild}
                  />
                </SlotContext.Provider>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

const SlotContext = React.createContext<string | undefined>(undefined);
SlotContext.displayName = 'SlotContext';

const SlotChild: React.FC<{ idx: number }> = ({ idx }: { idx: number }) => {
  const slotName = useContext(SlotContext)!;
  return (
    <>
      <ElementLayer />
      <PlopTarget idx={idx} slot={slotName} />
    </>
  );
};

// TODO: Move to a molecule?
function useSlotChildNodes(slotName: string) {
  const nodeAtom = useNodeAtom();
  const slotChildrenAtom = useMemo(() => {
    return splitAtom(
      // Need to replace this to not replace souls
      focusAtom(nodeAtom, (o) =>
        optic_<RaisinNodeWithChildren>()
          .prop('children')
          .filter((c) => isInSlot(c, slotName))
      )
    );
  }, [slotName, nodeAtom]);
  const childNodes = useAtomValue(slotChildrenAtom, RaisinScope);
  return childNodes;
}

// TODO: Move this util functions
function isInSlot(c: RaisinNode, slotName: string): boolean {
  const slotNameForNode = isElementNode(c) ? c.attribs.slot : undefined;
  if (!slotName && !slotNameForNode) {
    // Default slot (might not have a slot attributes)
    // Have to hanlde undefined.
    return true;
  }
  return slotName === slotNameForNode;
}

function PlopTarget({ idx, slot }: { idx: number; slot: string }) {
  const { canPlopHereAtom, plopNodeHere } = useMolecule(NodeMolecule);
  const canPlop = useAtomValue(canPlopHereAtom, RaisinScope);
  const plopNode = useSetAtom(plopNodeHere, RaisinScope);
  const plop = useCallback(() => plopNode({ idx, slot }), [idx, slot]);

  const isPloppablable = canPlop({ slot, idx });
  if (!isPloppablable) {
    return <></>;
  }
  return (
    <div style={{ border: '1px dashed red' }}>
      Position {idx} in {slot || 'content'}
      <button onClick={plop}>Plop</button>
    </div>
  );
}
