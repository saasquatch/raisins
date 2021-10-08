import {
  getNode, RaisinElementNode,
  RaisinNodeWithChildren,
  RaisinTextNode,
  htmlUtil
} from '@raisins/core';
import { ElementType } from 'domelementtype';
import React, { ChangeEventHandler, useState } from 'react';
import { Model } from '../model/EditorModel';
import ControlledProseEditor, {
  ProseTextSelection,
  RaisinProseState
} from '../ProseEditor';
import { isElementNode, isTextNode } from './isNode';

const {replacePath} = htmlUtil;
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
      <WithSelectionEditor node={element} model={model} />
      <ul>
        {element.children.filter(isTextNode).map((c) => {
          return <TextNodeEditor node={c} model={model} />;
        })}
      </ul>
    </div>
  );
}

/**
 * Manage prose selection state locally (for the time being).
 *
 * This state should be pulled up to the top
 */
export function WithSelectionEditor({
  node,
  model,
}: {
  node: RaisinNodeWithChildren;
  model: Model;
}) {
  const [selection, setSelect] = useState<ProseTextSelection>();

  const path = model.getPath(node);

  const setState: React.Dispatch<React.SetStateAction<RaisinProseState>> = (
    next
  ) => {

    model.setNode(prev=>{
      const prevNode = getNode(prev, path);
      const previousstate: RaisinProseState = {
        selection,
        node: {
          type: ElementType.Root,
          // @ts-ignore
          children: prevNode.children,
        },
      };
      const nextVal = typeof next === 'function' ? next(previousstate) : next;
  
      const nextNode = {
        ...prevNode,
        children: nextVal.node.children,
      };
      console.log("Replace node", prevNode, nextNode)
      
      setSelect(nextVal.selection);
      return replacePath(prev, path, nextNode)
    });
  };

  const state: RaisinProseState = {
    selection,
    node: {
      type: ElementType.Root,
      children: node.children,
    },
  };
  return <ControlledProseEditor {...{ state, setState }} />;
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
