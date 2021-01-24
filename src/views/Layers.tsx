import { h, FunctionalComponent, VNode } from '@stencil/core';
import { Model } from '../model/Dom';
import { getAncestry, getParent, NodeVisitor, visit } from '../util';
import { css } from '@emotion/css';
import { getSlots } from '../components/raisin-editor/getSlots';
import { getId } from '../components/raisin-editor/useEditor';
import { RaisinElementNode, RaisinNode } from '../model/RaisinNode';
// import { attributesToProps } from '../attributesToProps';

const Layer = css`
  position: relative;
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
  height: 1px;
  overflow: visible;
  position: relative;
`;

const DropLabel = css`
  position: absolute;
  top: -30px;
  height: 30px;
  box-sizing: border-box;
  background: red;
  color: white;
`;
export const Layers: FunctionalComponent<Model> = (model: Model) => {
  function DropSlot(props: { node: RaisinNode; idx: number; slot: string }) {
    const claz = {
      [DropTarget]: !model.isDragActive,
      [PossibleDropTarget]: model.isDragActive,
      // [ActiveDropTarget]:  === props.node
    };
    return (
      <div class={DropTargetWrapper}>
        <div class={claz} ref={e => model.setDroppableRef(props.node, e, props.idx, props.slot)}>
          {/* {props.idx} */}
        </div>
      </div>
    );
  }

  const ElementVisitor: NodeVisitor<VNode> = {
    onText: () => undefined,
    onElement(element, _) {
      const dragStyle = element === model.dragCoords?.element ? { transform: 'translate(' + model.dragCoords.x + 'px, ' + model.dragCoords.y + 'px)' } : {};

      const meta = model.getComponentMeta(element);
      const name = (
        <span onClick={() => model.setSelected(element)}>
          <span class={Label}>{meta?.title || element.name}</span>
          <span class={{ [Handle]: true, handle: true }}>[=]</span>

          <button onClick={() => model.duplicateNode(element)}>+</button>
          <button onClick={() => model.removeNode(element)}>x</button>

          <button onClick={() => model.moveUp(element)}>↑</button>
          <button onClick={() => model.moveDown(element)}>↓</button>
        </span>
      );
      // const hasChildren = children?.length > 0;
      const nodeWithSlots = getSlots(element);
      const dropNode = model.dropTarget?.from?.model;
      const isDroppable = element === dropNode;

      const slots = nodeWithSlots.slots || [];
      const hasSlots = slots?.length > 0;
      return (
        <div
          class={{
            [Layer]: element !== model.selected,
            [Selected]: element === model.selected,
            [DropLayer]: isDroppable,
          }}
          style={dragStyle}
          ref={el => model.setDraggableRef(element, el)}
          key={getId(element)}
        >
          {isDroppable && (
            <div class={DropLabel}>
              <DepthLabel node={model.dropTarget.to.model} model={model}>
                slot {model.dropTarget.to.slot} at {model.dropTarget.to.idx}
              </DepthLabel>
            </div>
          )}
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
                        <DropSlot node={element} idx={0} slot={s.key} />
                        {s.children
                          .filter(x => x)
                          .map((c, idx) => {
                            const childElement = visit(c.node, ElementVisitor, false);
                            // Doesn't render empty text nodes
                            return childElement && [childElement, <DropSlot node={element} idx={idx + 1} slot={s.key} />];
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
    onRoot(_, children) {
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

function DepthLabel(props: { node: RaisinNode; model: Model }, children: VNode[]): VNode {
  const parents = getAncestry(props.model.node, props.node);
  if (parent) {
    const str = parents.map(n => (n as RaisinElementNode).tagName).join('&gt;');
    return <span>{str}</span>;
  }

  return <div>{children}</div>;
}
