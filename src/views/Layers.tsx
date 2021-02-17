import { h, FunctionalComponent, VNode } from '@stencil/core';
import { Block, Model } from '../model/Dom';
import { clone, getAncestry, NodeVisitor, visit } from '../util';
import { css } from '@emotion/css';
import { getSlots } from '../components/raisin-editor/getSlots';
import { getId } from '../components/raisin-editor/useEditor';
import { RaisinElementNode, RaisinNode } from '../model/RaisinNode';
import { Handle } from './Handle';
import { Button } from './Button';

const Hidden = css`
  display: none;
`;
const Layer = css`
  position: relative;
  user-select: none;
  padding: 10px 0;
  background: #eee;
  border: 1px solid #ccc;
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
  line-height: 28px;
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
  // overflow: visible;
  position: relative;
`;

const DropLabel = css`
  background: red;
  color: white;
`;
const TitleBar = css`
  display: flex;
  justify-content: space-between;
`;
const Toolbar = css`
  // order: -1;
`;
const GreyOut = css`
  opacity: 0.2;
`;

export const Layers: FunctionalComponent<Model> = (model: Model) => {
  const greyOnDrag = { [GreyOut]: model.isDragActive };
  function AddNew(props: { node: RaisinNode; idx: number; slot: string }) {
    const slots = model.getComponentMeta(props.node as RaisinElementNode)?.slots;
    if (!slots) {
      return <span>No slots</span>;
    }
    const slotMeta = slots.find(s => s.key === props.slot);
    if (!slotMeta) {
      return (
        <span>
          No slot meta for {props.slot} {JSON.stringify(slots)}
        </span>
      );
    }
    const { childTags } = slotMeta;
    const filter = (block: RaisinElementNode) => childTags?.includes(block.tagName) || childTags?.includes('*');
    const validChildren = model.blocks.filter(filter);
    if (!validChildren.length) {
      return <span>No validChildren</span>;
    }
    return (
      <sl-dropdown class={greyOnDrag}>
        <sl-button slot="trigger" caret size="small">
          Add New
        </sl-button>
        <sl-menu>
          {model.blocks.filter(filter).map(b => {
            const meta = model.getComponentMeta(b);
            return (
              <sl-menu-item
                onClick={() =>
                  // TOOD: Better clone
                  model.insert(clone(b), props.node, props.idx)
                }
              >
                {meta.title}
              </sl-menu-item>
            );
          })}
        </sl-menu>
      </sl-dropdown>
    );
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
        <div onClick={() => model.setSelected(element)} class={TitleBar}>
          <div class={Label}>
            <Handle />
            {meta?.title || element.tagName}
          </div>
          <sl-button-group class={{ ...greyOnDrag, [Toolbar]: true }}>
            <Button onClick={() => model.duplicateNode(element)}>
              <sl-icon name="files"></sl-icon>
            </Button>
            <Button onClick={() => model.removeNode(element)}>
              <sl-icon name="trash"></sl-icon>
            </Button>
            <Button onClick={() => model.moveUp(element)}>
              {' '}
              <sl-icon name="arrow-bar-up"></sl-icon>
            </Button>
            <Button onClick={() => model.moveDown(element)}>
              {' '}
              <sl-icon name="arrow-bar-down"></sl-icon>
            </Button>
          </sl-button-group>
        </div>
      );
      // const hasChildren = children?.length > 0;
      const nodeWithSlots = getSlots(element, model.getComponentMeta);
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
          {!hasSlots && name}
          {hasSlots && (
            // <details>
            <div>
              {name}
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
                        <AddNew node={element} idx={s.children.length} slot={s.key} />
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
      return <div>{children}</div>;
    },
  };

  return (
    <div>
      {visit(model.node, ElementVisitor)}
      <DepthLabel model={model} />
      <DragBuddy model={model} />
    </div>
  );
};

/**
 *  Follows the cursor to indicate a drag.
 */
function DragBuddy(props: { model: Model }): VNode {
  return <div ref={props.model.setDragBuddy}>Drag buddy!</div>;
}
/**
 * Positioned next to a drop target to indicate a possible drop location
 */
function DepthLabel(props: { model: Model }): VNode {
  const hasDroppable = typeof props.model.dropTarget?.to?.model !== 'undefined';
  if (!hasDroppable) {
    // Empty tooltip
    return (
      <div
        class={Hidden}
        ref={props.model.setPopperElement}
        // @ts-ignore
        style={props.model.popper.styles.popper}
        {...props.model.popper.attributes.popper}
      ></div>
    );
  }
  const parents = getAncestry(props.model.node, props.model.dropTarget?.to?.model);
  const str = [props.model.dropTarget?.to?.model, ...parents]
    .reverse()
    .map(n => props.model.getComponentMeta(n as RaisinElementNode).title ?? 'root')
    .join(' > ');
  const target = props.model.dropTarget?.to?.model as RaisinElementNode;
  const targetName = props.model.getComponentMeta(target).title;
  const targetIndex = props.model.dropTarget?.to?.idx;
  const indexName = getOrdinal(targetIndex + 1);
  const slotName = props.model.dropTarget?.to?.slot || 'default';
  return (
    <div
      // class={DropLabel}
      ref={props.model.setPopperElement}
      // @ts-ignore
      style={props.model.popper.styles.popper}
      {...props.model.popper.attributes.popper}
    >
      <sl-card style={{ width: '200px' }}>
        <div slot="header">
          Move to <b>{targetName}</b>
        </div>
        <span style={{ color: '#ccc' }}>
          Will be the <b>{indexName}</b> element in the <b>{slotName} slot</b> of <b>{str}</b>
        </span>
      </sl-card>

      {/* <sl-badge type="success" pill>
        Drop here
      </sl-badge> */}
    </div>
  );
}

/**
 * Converts a number into a human ordinal
 *
 * Source: https://gist.github.com/jlbruno/1535691/db35b4f3af3dcbb42babc01541410f291a8e8fac
 * @param n
 */
function getOrdinal(n: number): string {
  var s = ['th', 'st', 'nd', 'rd'],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
