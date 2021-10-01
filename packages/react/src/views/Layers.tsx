import {
  htmlUtil,
  RaisinElementNode,
  RaisinNodeVisitor as NodeVisitor,
} from '@raisins/core';
import SlButtonGroup from '@shoelace-style/react/dist/button-group';
import SlDropdown from '@shoelace-style/react/dist/dropdown';
import SlMenu from '@shoelace-style/react/dist/menu';
import SlMenuItem from '@shoelace-style/react/dist/menu-item';
import React, { FC } from 'react';
import styled from 'styled-components';
import { Model } from '../model/EditorModel';

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

export const Layers: FC<Model> = (model) => {
  function AddNew(props: {
    node: RaisinElementNode;
    idx: number;
    slot: string;
  }) {
    const validChildren = model.getValidChildren(props.node, props.slot);
    if (!validChildren.length) {
      return <div />;
    }
    return (
      <SlDropdown>
        <button slot="trigger">Add New</button>
        <SlMenu>
          {validChildren.map((b) => {
            const meta = model.getComponentMeta(b);
            return (
              <SlMenuItem>
                <span
                  onClick={() => model.insert(clone(b), props.node, props.idx)}
                >
                  {meta.title}
                </span>
              </SlMenuItem>
            );
          })}
        </SlMenu>
      </SlDropdown>
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
                  {slots.map((s) => (
                    <SlotContainer>
                      <SlotName>{s.slot.title ?? s.slot.name}</SlotName>
                      <SlotChildren>
                        {s
                          .children!.filter((x) => x)
                          .map((c) => {
                            const childElement = visit(
                              c.node,
                              ElementVisitor,
                              false
                            );
                            // Doesn't render empty text nodes
                            return childElement;
                          })}
                        <AddNew
                          node={element}
                          idx={s.children!.length}
                          slot={s.slot.name}
                        />
                      </SlotChildren>
                    </SlotContainer>
                  ))}
                </div>
              )}{' '}
            </div>
          )}
        </Layer>
      );
    },
    onRoot(_, children) {
      return <div data-root>{children}</div>;
    },
  };

  return <div data-layers>{visit(model.node, ElementVisitor)}</div>;
};
