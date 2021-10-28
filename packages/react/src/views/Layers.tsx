import { htmlUtil, RaisinDocumentNode, RaisinElementNode } from '@raisins/core';
import { atom, useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { NodeAtomProvider, useNodeAtom } from '../atoms/node-context';
import { ComponentModelAtom } from '../component-metamodel/ComponentModel';
import { ChildrenEditor } from '../controllers/ChildrenEditor';
import { useCoreEditingApi } from '../editting/CoreEditingAPI';
import { RootNodeAtom } from '../hooks/useCore';
import { NamedSlot } from '../model/EditorModel';
import { RichTextEditorForAtom } from '../rich-text/RichTextEditor';
import { SelectedAtom, SelectedNodeAtom } from '../selection/SelectedAtom';
import { isElementNode } from '../util/isNode';

const { clone, visit } = htmlUtil;

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
  const hasChildren = useAtomValue(RootHasChildren);

  return (
    <div data-layers>
      {' '}
      Don't re-render unless number of children changes!
      <div layer-root>
        <NodeAtomProvider nodeAtom={RootNodeAtom}>
          {hasChildren && <ChildrenEditor Component={ElementLayer} />}
          {!hasChildren && <AddNew idx={0} />}
        </NodeAtomProvider>
      </div>
    </div>
  );
};

function AddNew(props: { idx: number; slot?: string }) {
  const node = useAtomValue(useNodeAtom());
  const model = useCoreEditingApi();
  const comp = useAtomValue(ComponentModelAtom);

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
  const [selected] = useAtom(SelectedNodeAtom);
  const setSelected = useUpdateAtom(SelectedAtom);
  const model = useCoreEditingApi();
  const comp = useAtomValue(ComponentModelAtom);
  const [node] = useAtom(useNodeAtom());

  // Don't render non-element layers
  if (!isElementNode(node)) return <></>;

  const element = node as RaisinElementNode;

  const meta = comp.getComponentMeta(element);

  const name = (
    <TitleBar onClick={() => setSelected(element)}>
      <Label>{meta?.title || element.tagName}</Label>
      <Toolbar>
        <button onClick={() => model.duplicateNode(element)}>dupe</button>
        <button onClick={() => model.removeNode(element)}>del</button>
      </Toolbar>
    </TitleBar>
  );
  // const hasChildren = children?.length > 0;
  const nodeWithSlots = comp.getSlots(element);

  const slots = nodeWithSlots.slots || [];
  const hasSlots = slots?.length > 0;
  return (
    <Layer data-element selected={selected === element}>
      {!hasSlots && name}
      {hasSlots && (
        <div>
          {name}
          {hasSlots && <div>{slots.map((s) => <SlotWidget s={s}/>)}</div>}{' '}
        </div>
      )}
    </Layer>
  );
}

function SlotWidget({ s }: { s: NamedSlot }) {
  const isEmpty = (s.children?.length ?? 0) <= 0;
  const slotWidget = s.slot.editor;
  const hasEditor = slotWidget === 'inline';
  return (
    <SlotContainer>
      <SlotName>{s.slot.title ?? s.slot.name}</SlotName>
      {hasEditor && (
        // Rich Text Editor<>
        <RichTextEditorForAtom />
      )}
      {!hasEditor && (
        // Block Editor
        <>
          {isEmpty && (
            <AddNew idx={s.children?.length ?? 0} slot={s.slot.name} />
          )}
          {!isEmpty && (
            <SlotChildren>
              {
                // TODO: Split atoms
                // s.children
                //   ?.filter((x) => x)
                //   .map((c) => {
                //     const childElement = visit(
                //       c.node,
                //       ElementVisitor,
                //       false
                //     );
                //     // Doesn't render empty text nodes
                //     return childElement;
                //   })
              }
            </SlotChildren>
          )}
        </>
      )}
    </SlotContainer>
  );
}
