import {
  getNode,
  htmlUtil,
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNodeWithChildren,
  RaisinTextNode,
} from '@raisins/core';
import { ElementType } from 'domelementtype';
import { Atom, atom, SetStateAction } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import React, { ChangeEventHandler, useEffect, useRef } from 'react';
import { Model } from '../model/EditorModel';
import { useAtomState, useSelectionAtom } from '../ProseEditor';
import { isElementNode, isTextNode } from './isNode';

const { replacePath } = htmlUtil;
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
  const selection = useSelectionAtom();
  const nodeAtom = useValueAtom(node);
  const path = model.getPath(node);

  // Atom doesn't use get or set, so it's safe to be synthetic and different every render?
  const docNodeAtom = useRef(
    atom<RaisinDocumentNode, SetStateAction<RaisinDocumentNode>>(
      (get) => {
        return {
          type: ElementType.Root,
          children: get(nodeAtom).children,
        };
      },
      (get, set, next) => {
        model.setNode((prev) => {
          const prevNode = getNode(prev, path);
          const prevDocNode = {
            type: ElementType.Root,
            children: node.children,
          } as RaisinDocumentNode;
          const nextVal = typeof next === 'function' ? next(prevDocNode) : next;
          const nextNode = {
            ...prevNode,
            children: nextVal.children,
          };
          return replacePath(prev, path, nextNode);
        });
      }
    )
  ).current;

  const { mountRef } = useAtomState(docNodeAtom, selection);

  return <div ref={mountRef} />;
}

/**
 * Creates a derived atom from a react render value
 *
 * Useful for bridging between useState and Jotai Atoms
 *
 * @param value
 * @returns
 */
function useValueAtom<T>(value: T): Atom<T> {
  const nodeAtom = useRef(atom(value)).current;
  const update = useUpdateAtom(nodeAtom);
  useEffect(() => {
    update(value);
  }, [value, update]);

  return nodeAtom;
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
