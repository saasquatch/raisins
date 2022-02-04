import {
  htmlUtil,
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { Slot } from '@raisins/schema/schema';
import { atom } from 'jotai';
import { focusAtom } from 'jotai/optics';
import { splitAtom, useAtomValue } from 'jotai/utils';
import { optic_ } from 'optics-ts';
import React, {
  CSSProperties,
  FC,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { PloppingIsActive } from '../atoms/pickAndPlopAtoms';
import { RaisinScope } from '../atoms/RaisinScope';
import { ComponentModelAtom } from '../component-metamodel/ComponentModel';
import {
  ChildrenEditor,
  ChildrenEditorForAtoms,
} from '../controllers/ChildrenEditor';
import { useCoreEditingApi } from '../editting/useCoreEditingAPI';
import { RootNodeAtom } from '../hooks/CoreAtoms';
import {
  canPlopHereAtom,
  duplicateForNode,
  isNodeAnElement,
  isNodeHovered,
  isNodePicked,
  isSelectedForNode,
  nameForNode,
  plopNodeHere,
  removeForNode,
  setSelectedForNode,
  slotsForNode,
  togglePickNode,
} from '../node/AtomsForNode';
import { NodeAtomProvider, useNodeAtom } from '../node/node-context';
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

const RootHasChildren = atom(
  (get) => (get(RootNodeAtom) as RaisinDocumentNode).children.length > 0
);
export const Layers: FC<{}> = () => {
  const hasChildren = useAtomValue(RootHasChildren, RaisinScope);

  return (
    <div data-layers>
      {' '}
      Don't re-render unless number of children changes!
      <div data-layers-root>
        <NodeAtomProvider nodeAtom={RootNodeAtom}>
          {hasChildren && <ChildrenEditor Component={ElementLayer} />}
          {!hasChildren && <AddNew idx={0} />}
        </NodeAtomProvider>
      </div>
    </div>
  );
};

function AddNew(props: { idx: number; slot?: string }) {
  const node = useAtomValue(useNodeAtom(), RaisinScope);
  const model = useCoreEditingApi();
  const comp = useAtomValue(ComponentModelAtom, RaisinScope);

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
            const meta = comp.getComponentMeta(b.content);
            return (
              <button
                onClick={() => {
                  const cloned = clone(b.content) as RaisinElementNode;
                  // TODO: add "insert into slot" into core model?
                  props.slot && (cloned.attribs.slot = props.slot);
                  model.insert({
                    node: cloned,
                    parent: node,
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

function ElementLayer() {
  const setSelected = setSelectedForNode.useUpdate();
  const isAnElement = isNodeAnElement.useValue();
  const isSelected = isSelectedForNode.useValue();
  const isPicked = isNodePicked.useValue();
  const isHovered = isNodeHovered.useValue();
  const nodeWithSlots = slotsForNode.useValue();

  const removeNode = removeForNode.useUpdate();
  const duplicate = duplicateForNode.useUpdate();
  const title = nameForNode.useValue();
  const moveNode = togglePickNode.useUpdate();

  const isPlopping = useAtomValue(PloppingIsActive, RaisinScope);
  const canMove = isPicked || !isPlopping;
  // Don't render non-element layers
  if (!isAnElement) return <></>;

  const name = (
    <div style={TitleBar} onClick={setSelected}>
      <div style={Label}>
        {title} {isPicked && ' Moving...'}{' '}
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
                <ChildrenEditorForAtoms
                  childAtoms={childNodes}
                  Component={({ idx }: { idx: number }) => (
                    <>
                      <ElementLayer />
                      <PlopTarget idx={idx} slot={s.name} />
                    </>
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

function useSlotChildNodes(slotName: string) {
  const nodeAtom = useNodeAtom();
  const slotChildrenAtom = useMemo(() => {
    return splitAtom(
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
  const canPlop = canPlopHereAtom.useValue();
  const plopNode = plopNodeHere.useUpdate();
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
