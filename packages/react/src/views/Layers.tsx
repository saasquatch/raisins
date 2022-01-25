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
import React, { FC, useCallback, useMemo, useState } from 'react';
import styleToObject from 'style-to-object';
import { ploppingIsActive } from '../atoms/pickAndPlopAtoms';
import { RaisinScope } from '../atoms/RaisinScope';
import { ComponentModelAtom } from '../component-metamodel/ComponentModel';
import {
  ChildrenEditor,
  ChildrenEditorForAtoms,
} from '../controllers/ChildrenEditor';
import { useCoreEditingApi } from '../editting/useCoreEditingAPI';
import { RootNodeAtom } from '../hooks/CoreAtoms';
import {
  duplicateForNode,
  isNodeAnElement,
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

const Label = styleToObject(`
  cursor: pointer;
  line-height: 28px;
`)!;

const Layer = styleToObject(`
  position: relative;
  user-select: none;
  cursor: pointer;
  padding: 10px 0;
  outline-offset: -2px;
`)!;
const SelectedLayer = styleToObject(`
  outline: '2px solid red';
  outline-offset: -2px;
`)!;

const SlotContainer = styleToObject(`
  margin-left: 3px;
  display: flex;
  padding: 0 0 3px 0;
`)!;

const SlotName = styleToObject(`
  writing-mode: vertical-lr;
  text-orientation: sideways;
  font-size: 0.7em;
  padding: 5px 0 5px 2px;
  color: grey;
  background: rgba(0, 0, 0, 0.1);
`)!;

const SlotChildren = styleToObject(`
  width: 100%;
`)!;

const TitleBar = styleToObject(`
  display: flex;
  justify-content: space-between;
`)!;

const AddBlock = styleToObject(`
  flex: 1;
  width: 100%;
  justify-self: stretch;
  align-self: stretch;
  background: rgba(0, 0, 255, 0.1);
  color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
`)!;

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
  const nodeWithSlots = slotsForNode.useValue();

  const removeNode = removeForNode.useUpdate();
  const duplicate = duplicateForNode.useUpdate();
  const title = nameForNode.useValue();
  const moveNode = togglePickNode.useUpdate();

  // Don't render non-element layers
  if (!isAnElement) return <></>;

  const name = (
    <div style={TitleBar} onClick={setSelected}>
      <div style={Label}>
        {title} {isPicked && ' Moving...'}{' '}
      </div>
      <div>
        <button onClick={duplicate}>dupe</button>
        <button onClick={removeNode}>del</button>
        <button onClick={moveNode}>move</button>
      </div>
    </div>
  );
  // const hasChildren = children?.length > 0;

  const slots = nodeWithSlots ?? [];
  const hasSlots = slots?.length > 0;
  const style = {
    ...Layer,
    ...(isSelected ? SelectedLayer : {}),
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
  const isPlopActive = useAtomValue(ploppingIsActive);
  const plopNode = plopNodeHere.useUpdate();
  const plop = useCallback(() => plopNode({ idx, slot }), [idx, slot]);

  return (
    <div style={{ border: '1px dashed red' }}>
      Position {idx} in {slot || 'content'}
      <button onClick={plop}>Plop</button>
    </div>
  );
}
