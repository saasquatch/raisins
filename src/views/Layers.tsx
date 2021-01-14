import { h, FunctionalComponent } from '@stencil/core';
import { Model } from '../model/Dom';
import * as DOMHandler from 'domhandler';
import domutils from 'domutils';

export const Layers: FunctionalComponent<Model> = (model: Model) => {
  const remove = (n: DOMHandler.Node) => {
    domutils.removeElement(n);
    const next = model.node.cloneNode(true);
    model.setState(next);
  };
  return (
    <div>
      Layers:
      <ul>
        <ElementView node={model.node} remove={remove} />
      </ul>
    </div>
  );
};

function ElementView(props: { node: DOMHandler.Node; remove: (n: DOMHandler.Node) => void }) {
  const { node } = props;
  // @ts-ignore
  const children = node.children ? (node as DOMHandler.NodeWithChildren).children: undefined;
  const element = node.type === 'tag' ? node as DOMHandler.Element : undefined;

  return (
    <li>
      <span>
        {(element && element.name) || node.type}
        <button onClick={() => props.remove(props.node)}>x</button>
      </span>
      {children && (
        <ul>
          {children
            .filter(c => c.type === 'tag')
            .map(c => (
              <ElementView node={c} remove={props.remove} />
            ))}
        </ul>
      )}
    </li>
  );
}
