import { h, FunctionalComponent, VNode } from '@stencil/core';
import { Model } from '../model/Dom';
// import * as DOMHandler from 'domhandler';
// import domutils from 'domutils';
import { NodeVisitor, visit } from '../util';
import { css } from '@emotion/css';
import { getSlots } from '../components/raisin-editor/getSlots';

const Layer = css`
  user-select: none;
  padding: 5px 20px;
  background: #ccc;
  border-bottom: 2px solid #fff;
`;
const Selected = css`
  ${Layer};
  background: #eee;
  outline: 1px solid red;
`;
const Label = css`
  cursor: pointer;
  padding: 20px;
`;
const Handle = css`
  cursor: move;
  display: inline-block;
  padding: 3px;
  background: #aaa;
`;

export const Layers: FunctionalComponent<Model> = (model: Model) => {
  const ElementVisitor: NodeVisitor<VNode> = {
    onElement(element, children) {
      const dragStyle = element === model.dragCoords?.element ? { transform: 'translate(' + model.dragCoords.x + 'px, ' + model.dragCoords.y + 'px)' } : {};
      const name = (
        <span onClick={() => model.setSelected(element)}>
          <span class={Label}>{element.name}</span>
          <span class={{ [Handle]: true, handle: true }}>[=]</span>
          <button onClick={() => model.duplicateNode(element)}>+</button>
          <button onClick={() => model.removeNode(element)}>x</button>

          <button onClick={() => model.moveUp(element)}>↑</button>
          <button onClick={() => model.moveDown(element)}>↓</button>
        </span>
      );
      const hasChildren = children?.length > 0;
      const nodeWithSlots = getSlots(element);

      const slots = nodeWithSlots.slots || [];
      const hasSlots = slots?.length > 0;
      return (
        <div
          class={{
            [Layer]: element !== model.selected,
            [Selected]: element === model.selected,
          }}
          style={dragStyle}
          ref={el => model.setDraggableRef(element, el)}
        >
          {!hasSlots && name}
          {hasSlots && (
            <details>
              <summary>{name}</summary>
              {hasSlots && (
                <div>
                  {slots.map(s => (
                    <div>
                      <div>---- {s.name} ----({s.children?.length})</div>
                      {s.children.map(c => visit(c.node, ElementVisitor, false))}
                      <div ref={e => model.setDroppableRef(element, e)}>drop target</div>
                    </div>
                  ))}
                </div>
              )}{' '}
            </details>
          )}
        </div>
      );
      // return <div></div>
    },
    onRoot(r, children) {
      return children && <div>{children}</div>;
    },
  };

  return (
    <div>
      Layers:
      {visit(model.node, ElementVisitor)}
    </div>
  );
};
