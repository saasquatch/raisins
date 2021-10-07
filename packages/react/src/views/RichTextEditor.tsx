import { ElementType } from 'domelementtype';
import React, { ChangeEventHandler } from 'react';
import { RaisinElementNode, RaisinTextNode } from '../../../core/dist';
import { Model } from '../model/EditorModel';
import { isElementNode, isTextNode } from './isNode';

export default function RichTextEditor(props: Model) {
  const { selected } = props;

  if (!isElementNode(selected)) return <div>Not an element</div>;

  const element = selected;
  return <TextNodesEditor element={element} model={props} />;
}

export function TextNodesEditor({
  element,
  model,
}: {
  element: RaisinElementNode;
  model: Model;
}) {
  return (
    <div>
      <ul>
        {element.children.filter(isTextNode).map((c) => {
          return <TextNodeEditor node={c} model={model} />;
        })}
      </ul>
    </div>
  );
}

export function TextNodeEditor({
  node,
  model,
}: {
  node: RaisinTextNode;
  model: Model;
}) {
  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const nextValue: RaisinTextNode = {
      type: ElementType.Text,
      nodeType: node.nodeType,
      data: e.target.value,
    };
    model.replaceNode(node, nextValue);
  };

  return (
    <li>
      <input type="text" value={node.data} onChange={onChange} />
    </li>
  );
}
