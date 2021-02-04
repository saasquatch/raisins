import { h, FunctionalComponent, VNode } from '@stencil/core';
import { Model } from '../model/Dom';
import { getAncestry, NodeVisitor, visit } from '../util';
import { css } from '@emotion/css';
import { getSlots } from '../components/raisin-editor/getSlots';
import { getId } from '../components/raisin-editor/useEditor';
import { RaisinElementNode, RaisinNode, RaisinTextNode } from '../model/RaisinNode';
import { ElementType } from 'domelementtype';

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
  margin-left: 3px;
  border: 1px dotted #000;
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
  function AddNew(props: { node: RaisinNode; idx: number; slot: string }) {
    const claz = {
      [DropTarget]: !model.isDragActive,
      [PossibleDropTarget]: model.isDragActive,
      // [ActiveDropTarget]:  === props.node
    };
    const divNode = {
      type: ElementType.Tag,
      tagName: 'div',
      nodeType: 1,
      attribs: {},
      children: [{ type: ElementType.Text, data: 'I am a div' } as RaisinTextNode],
    };
    return <button onClick={e => model.insert(divNode, props.node, props.idx)}>Add div here</button>;
  }

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
          <span class={Label}>{meta?.title || element.tagName}</span>
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
              <DepthLabel node={element} model={model} />
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
                        <AddNew node={element} idx={0} slot={s.key} />
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
      <div>
        {
          //@ts-ignore
          model.dropTarget?.from?.model.tagName
        }{' '}
        {model.dropTarget?.from?.idx} in {model.dropTarget?.from?.slot} of{' '}
        {
          // TODO: For some reason this isn't returning anything
          //@ts-ignore
          model.parents.get(model.dropTarget?.from?.model)?.tagName ?? 'No parent'
        }
      </div>
      Dropping to
      <div>
        {
          //@ts-ignore
          model.dropTarget?.to?.model.tagName
        }{' '}
        {model.dropTarget?.to?.idx} in {model.dropTarget?.to?.slot}
      </div>
    </div>
  );
};

function DepthLabel(props: { node: RaisinNode; model: Model }): VNode {
  const parents = getAncestry(props.model.node, props.model.dropTarget?.to?.model);
  const str = [props.model.dropTarget?.to?.model, ...parents]
    .reverse()
    .map(n => (n as RaisinElementNode).tagName ?? 'root')
    .join(' > ');
  return (
    <span>
      Drop to: {str} at {props.model.dropTarget?.to?.idx} in {props.model.dropTarget?.to?.slot}
    </span>
  );
}
