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
import React, { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  duplicateForNode,
  isNodeAnElement,
  isSelectedForNode,
  nameForNode,
  removeForNode,
  setSelectedForNode,
  slotsForNode,
} from '../node/AtomsForNode';
import { NodeAtomProvider, useNodeAtom } from '../node/node-context';
import { RaisinScope } from '../atoms/RaisinScope';
import { ComponentModelAtom } from '../component-metamodel/ComponentModel';
import {
  ChildrenEditor,
  ChildrenEditorForAtoms,
} from '../controllers/ChildrenEditor';
import { useCoreEditingApi } from '../editting/useCoreEditingAPI';
import { RootNodeAtom } from '../hooks/CoreAtoms';
import { RichTextEditorForAtom } from '../rich-text/RichTextEditor';
import { isElementNode, isRoot } from '../util/isNode';

const { clone } = htmlUtil;

const Label = styled.div`
  cursor: pointer;
  line-height: 28px;
`;

const Layer = styled.div<{ selected: boolean }>`
  position: relative;
  user-select: none;
  cursor: pointer;
  padding: 10px 0;

  background: ${(props) =>
    props.selected ? 'var(--sl-color-gray-800)' : 'var(--sl-color-gray-900)'};
  outline: ${(props) => (props.selected ? '2px solid red' : 'inherit')};
  outline-offset: -2px;
`;

const SlotContainer = styled.div`
  margin-left: 3px;
  display: flex;
  padding: 0 0 3px 0;
`;

const SlotName = styled.div`
  writing-mode: vertical-lr;
  text-orientation: sideways;
  font-size: 0.7em;
  padding: 5px 0 5px 2px;
  color: grey;
  background: rgba(0, 0, 0, 0.1);
`;
const SlotChildren = styled.div`
  width: 100%;
`;

const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
`;
const Toolbar = styled.div`
  // order: -1;
`;

const AddBlock = styled.div`
  flex: 1;
  width: 100%;
  justify-self: stretch;
  align-self: stretch;
  background: rgba(0, 0, 255, 0.1);
  color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
`;

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
        <AddBlock onClick={() => setOpen(true)}>
          <div>Insert</div>
        </AddBlock>
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
  const nodeWithSlots = slotsForNode.useValue();

  const removeNode = removeForNode.useUpdate();
  const duplicate = duplicateForNode.useUpdate();
  const title = nameForNode.useValue();
  // Don't render non-element layers
  if (!isAnElement) return <></>;

  const name = (
    <TitleBar onClick={setSelected}>
      <Label>{title}</Label>
      <Toolbar>
        <button onClick={duplicate}>dupe</button>
        <button onClick={removeNode}>del</button>
      </Toolbar>
    </TitleBar>
  );
  // const hasChildren = children?.length > 0;

  const slots = nodeWithSlots ?? [];
  const hasSlots = slots?.length > 0;
  return (
    <Layer data-element selected={isSelected}>
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
    </Layer>
  );
}

function SlotWidget({ s }: { s: Slot }) {
  const childNodes = useSlotChildNodes(s.name);

  const slotWidget = s.editor;
  const hasEditor = slotWidget === 'inline';
  const isEmpty = (childNodes?.length ?? 0) <= 0;

  return (
    <SlotContainer>
      <SlotName>{s.title ?? s.name} ({childNodes.length})</SlotName>
      {hasEditor && (
        // Rich Text Editor<>
        <RichTextEditorForAtom />
      )}
      {!hasEditor && (
        // Block Editor
        <>
          {isEmpty && <AddNew idx={childNodes?.length ?? 0} slot={s.name} />}
          {!isEmpty && (
            <SlotChildren>
              <ChildrenEditorForAtoms
                childAtoms={childNodes}
                Component={ElementLayer}
              />
            </SlotChildren>
          )}
        </>
      )}
    </SlotContainer>
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
