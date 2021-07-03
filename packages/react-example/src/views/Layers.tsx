import { css } from '@emotion/css';
import { htmlUtil, RaisinElementNode, RaisinNodeVisitor as NodeVisitor } from '@raisins/core';
import { Model } from "../model/EditorModel";
import SlButtonGroup from '@shoelace-style/react/dist/button-group';
import SlDropdown from '@shoelace-style/react/dist/dropdown';
import SlMenu from '@shoelace-style/react/dist/menu';
import SlMenuItem from '@shoelace-style/react/dist/menu-item';
import classNames from 'classnames';
import React, { FC } from 'react';

const { clone, visit } = htmlUtil;

const Layer = css`
  position: relative;
  user-select: none;
  padding: 10px 0;
  background: var(--sl-color-gray-900);
  border: 1px solid #ccc;
`;

const Label = css`
  cursor: pointer;
  line-height: 28px;
`;

const Selected = css`
  ${Layer};
  background: var(--sl-color-gray-900);
  outline: 1px solid red;
  & ${Label} {
    font-weight: bold;
  }
`;

const SlotContainer = css`
  margin-left: 3px;
  border-left: 3px solid green;
  padding: 5px 0 5px 5px;
  display: flex;
`;

const SlotName = css`
  writing-mode: vertical-lr;
  text-orientation: sideways;
  display: none;
`;
const SlotChildren = css`
  width: 100%;
`;
const DropTarget = css`
  display: none;
  padding: 5px 0;
  // Creates a sizeable drop target without shifting content around the page
  // position: absolute;
  z-index: 5;
  top: -30px;
  width: 100%;
`;

const TitleBar = css`
  display: flex;
  justify-content: space-between;
`;
const Toolbar = css`
  // order: -1;
`;

export const Layers: FC<Model> = model => {
  function AddNew(props: { node: RaisinElementNode; idx: number; slot: string }) {
    const validChildren = model.getValidChildren(props.node, props.slot);
    if (!validChildren.length) {
      return <div />;
    }
    return (
      <SlDropdown>
        <button slot="trigger">Add New</button>
        <SlMenu>
          {validChildren.map(b => {
            const meta = model.getComponentMeta(b);
            return (
              <SlMenuItem>
                <span onClick={() => model.insert(clone(b), props.node, props.idx)}>{meta.title}</span>
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
        <div onClick={() => model.setSelected(element)} className={TitleBar}>
          <div className={Label}>
            {meta?.title || element.tagName}
          </div>
          <SlButtonGroup
            className={classNames({
              [Toolbar]: true,
            })}
          >
            <button onClick={() => model.duplicateNode(element)}>
              dupe
            </button>
            <button onClick={() => model.removeNode(element)}>
              del
            </button>
            <button onClick={() => model.moveUp(element)}>
            ↑
            </button>
            <button onClick={() => model.moveDown(element)}>
            ↓
            </button>
          </SlButtonGroup>
        </div>
      );
      // const hasChildren = children?.length > 0;
      const nodeWithSlots = model.getSlots(element);

      const slots = nodeWithSlots.slots || [];
      const hasSlots = slots?.length > 0;
      return (
        <div
          data-element
          className={classNames({
            [Layer]: element !== model.selected,
            [Selected]: element === model.selected,
          })}
          // TODO: removing this lines removes the Stencil re-render flash, but it also breaks drag and drop
          // key={getId(element)}
        >
          {!hasSlots && name}
          {hasSlots && (
            // <details>
            <div>
              {name}
              {hasSlots && (
                <div>
                  {slots.map(s => (
                    <div className={SlotContainer}>
                      <div className={SlotName}>{s.name}</div>
                      <div className={SlotChildren}>
                        {s
                          .children!.filter(x => x)
                          .map((c, idx) => {
                            const childElement = visit(c.node, ElementVisitor, false);
                            // Doesn't render empty text nodes
                            return childElement;
                          })}
                        <AddNew node={element} idx={s.children!.length} slot={s.key} />
                      </div>
                    </div>
                  ))}
                </div>
              )}{' '}
            </div>
          )}
        </div>
      );
    },
    onRoot(_, children) {
      return <div data-root>{children}</div>;
    },
  };

  return (
    <div data-layers>
      {visit(model.node, ElementVisitor)}
    </div>
  );
};
