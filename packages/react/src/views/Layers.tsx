import {
  htmlUtil,
  RaisinElementNode,
  RaisinNodeVisitor as NodeVisitor,
  RaisinNodeWithChildren,
} from '@raisins/core';
import SlButtonGroup from '@shoelace-style/react/dist/button-group';
import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { Model } from '../model/EditorModel';
import { TextNodeEditor, TextNodesEditor } from './RichTextEditor';

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
const Toolbar = styled(SlButtonGroup)`
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

export const Layers: FC<Model> = (model) => {
  function AddNew(props: {
    node: RaisinNodeWithChildren;
    idx: number;
    slot?: string;
  }) {
    const [open, setOpen] = useState(false);
    const validChildren = model.getValidChildren(props.node, props.slot);
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
              const meta = model.getComponentMeta(b.content);
              return (
                <button
                  onClick={() => {
                    const cloned = clone(b.content) as RaisinElementNode;
                    // TODO: add "insert into slot" into core model?
                    props.slot && (cloned.attribs.slot = props.slot);
                    model.insert(cloned, props.node, props.idx);
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

  const ElementVisitor: Partial<NodeVisitor<React.ReactNode>> = {
    onElement(element, _) {
      const meta = model.getComponentMeta(element);
      const name = (
        <TitleBar onClick={() => model.setSelected(element)}>
          <Label>{meta?.title || element.tagName}</Label>
          <Toolbar>
            <button onClick={() => model.duplicateNode(element)}>dupe</button>
            <button onClick={() => model.removeNode(element)}>del</button>
            <button onClick={() => model.moveUp(element)}>↑</button>
            <button onClick={() => model.moveDown(element)}>↓</button>
          </Toolbar>
        </TitleBar>
      );
      // const hasChildren = children?.length > 0;
      const nodeWithSlots = model.getSlots(element);

      const slots = nodeWithSlots.slots || [];
      const hasSlots = slots?.length > 0;
      return (
        <Layer data-element selected={model.selected === element}>
          {!hasSlots && name}
          {hasSlots && (
            <div>
              {name}
              {hasSlots && (
                <div>
                  {slots.map((s) => {
                    const isEmpty = (s.children?.length ?? 0) <= 0;
                    const slotWidget = s.slot.editor;
                    const hasEditor = slotWidget === 'inline';
                    return (
                      <SlotContainer>
                        <SlotName>{s.slot.title ?? s.slot.name}</SlotName>
                        {hasEditor && (
                          // Rich Text Editor<>
                          <TextNodesEditor element={element} model={model} />
                        )}
                        {!hasEditor && (
                          // Block Editor
                          <>
                            {isEmpty && (
                              <AddNew
                                node={element}
                                idx={s.children?.length ?? 0}
                                slot={s.slot.name}
                              />
                            )}
                            {!isEmpty && (
                              <SlotChildren>
                                {s.children
                                  ?.filter((x) => x)
                                  .map((c) => {
                                    const childElement = visit(
                                      c.node,
                                      ElementVisitor,
                                      false
                                    );
                                    // Doesn't render empty text nodes
                                    return childElement;
                                  })}
                              </SlotChildren>
                            )}
                          </>
                        )}
                      </SlotContainer>
                    );
                  })}
                </div>
              )}{' '}
            </div>
          )}
        </Layer>
      );
    },
    onRoot(root, children) {
      const hasChildren = root.children.length > 0;
      return (
        <div layer-root>
          {hasChildren && root.children.map((c) => visit(c, ElementVisitor))}
          {!hasChildren && <AddNew node={root} idx={0} />}
        </div>
      );
    },
  };

  return <div data-layers>{visit(model.node, ElementVisitor, false)}</div>;
};
