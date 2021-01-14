import { h, FunctionalComponent, VNode } from '@stencil/core';
import { Model } from '../model/Dom';
import * as DOMHandler from 'domhandler';
// import domutils from 'domutils';
import { NodeVisitor, visit, remove } from '../util';
import { css } from '@emotion/css';

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

export const Layers: FunctionalComponent<Model> = (model: Model) => {
  const ElementVisitor: NodeVisitor<VNode> = {
    onElement(element, children) {
      const name = (
        <span onClick={() => model.setSelected(element)}>
          {element && element.name}
          <button onClick={() => model.removeNode(element)}>x</button>
        </span>
      );
      const hasChildren = children?.length > 0;

      return (
        <div
          class={{
            [Layer]: element !== model.selected,
            [Selected]: element === model.selected,
          }}
        >
          {!hasChildren && name}
          {hasChildren && (
            <details>
              <summary>{name}</summary>
              {children}
            </details>
          )}
        </div>
      );
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
