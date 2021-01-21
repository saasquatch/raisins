import { h, FunctionalComponent, VNode } from '@stencil/core';
import { Model } from '../model/Dom';
import * as DOMHandler from 'domhandler';
// import domutils from 'domutils';
import { NodeVisitor, visit } from '../util';
import { css } from '@emotion/css';
import { getSlots } from '../components/raisin-editor/getSlots';
import { getId } from '../components/raisin-editor/useEditor';

const Layer = css`
  user-select: none;
  padding: 5px 0;
  background: #ccc;
  border-bottom: 2px solid #fff;
`;
const DropLayer = css`
  background: pink;
`;
const Selected = css`
  ${Layer};
  background: #eee;
  outline: 1px solid red;
`;
const Label = css`
  cursor: pointer;
  padding: 20px 0;
`;
const Handle = css`
  cursor: move;
  display: inline-block;
  padding: 3px;
  background: #aaa;
`;
const SlotContainer = css`
  border: 1px dotted #ccc;
  display: flex;
`;
const SlotName = css`
  writing-mode: vertical-lr;
  text-orientation: sideways;
  display: none;
`;
const SlotChildren = css`
  // width: 100%;
`;
const DropTarget = css`
  display: none;
  padding: 5px 0;
  // Creates a sizeable drop target without shifting content around the page
  // position: absolute;
  z-index: 2px;
  top: -30px;
  width: 100%;
`;
const PossibleDropTarget = css`
  ${DropTarget}
  // Background for debugging size of drop targets
  // background: rgb(0,0,255,0.2);
  display: block;
  &: before {
    content: ' ';
    background: blue;
    display: block;
    height: 4px;
  }
`;
const DropTargetWrapper = css`
  // height: 1px;
  overflow: visible;
  position: relative;
`;

export const Layers: FunctionalComponent<Model> = (model: Model) => {
  function DropSlot(props: { node: DOMHandler.Node; idx: number }) {
    const claz = {
      [DropTarget]: !model.isDragActive,
      [PossibleDropTarget]: model.isDragActive,
      // [ActiveDropTarget]:  === props.node
    };
    return (
      <div class={DropTargetWrapper}>
        <div class={claz} ref={e => model.setDroppableRef(props.node, e, props.idx)}>
          {props.idx}
        </div>
      </div>
    );
  }

  const ElementVisitor: NodeVisitor<VNode> = {
    onText: () => undefined,
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
      const dropElement = model.dropTarget && model.dropTarget[1];
      const dropNode = dropElement && model.elementToNode.get(dropElement);

      const slots = nodeWithSlots.slots || [];
      const hasSlots = slots?.length > 0;
      return (
        <div
          class={{
            [Layer]: element !== model.selected,
            [Selected]: element === model.selected,
            [DropLayer]: element === dropNode,
          }}
          style={dragStyle}
          ref={el => model.setDraggableRef(element, el)}
          key={getId(element)}
        >
          {!hasSlots && name}
          {hasSlots && (
            // <details>
            <div>
              <div>{name}</div>
              {hasSlots && (
                <div>
                  {slots.map(s => (
                    <div class={SlotContainer}>
                      <div class={SlotName}>{s.name}</div>
                      <div class={SlotChildren}>
                        <DropSlot node={element} idx={0} />
                        {s.children
                          .filter(x => x)
                          .map((c, idx) => {
                            const childElement = visit(c.node, ElementVisitor, false);
                            // Doesn't render empty text nodes
                            return childElement && [childElement, <DropSlot node={element} idx={idx + 1} />];
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              )}{' '}
            </div>
          )}
        </div>
      );
      // return <div></div>
    },
    onRoot(r, children) {
      return <div>{children}</div>;
      // return (
      //   children
      // && (
      //   <div>
      //     {children.map((c, idx) => {
      //       return [<DropSlot node={r} idx={idx} />, c];
      //     })}
      //   </div>
      // )
      // );
    },
  };

  return (
    <div>
      Layers:
      {visit(model.node, ElementVisitor)}
    </div>
  );
};
