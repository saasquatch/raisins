import {
  getNode,
  htmlUtil,
  RaisinDocumentNode,
  RaisinElementNode,
} from '@raisins/core';
import { ElementType } from 'domelementtype';
import { atom, PrimitiveAtom, SetStateAction } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import React, { useMemo, useRef } from 'react';
import { RaisinScope } from '../atoms/RaisinScope';
import { RootNodeAtom } from '../hooks/CoreAtoms';
import { useNodeAtom } from '../node/node-context';
import { useProseEditorOnAtom } from '../prosemirror/ProseEditor';
import { useSelectionAtom } from '../prosemirror/useSelectionAtom';
import { SelectedAtom, SelectedNodeAtom } from '../selection/SelectedAtom';
import { isElementNode } from '../util/isNode';

const { replacePath } = htmlUtil;

export default function RichTextEditor() {
  const isElementAtom = useRef(
    atom((get) => isElementNode(get(SelectedNodeAtom)))
  ).current;
  const isElement = useAtomValue(isElementAtom, RaisinScope);
  if (!isElement) return <div>Not an element</div>;

  return <WithSelectionEditor />;
}

/**
 * Manage prose selection state locally (for the time being).
 *
 * This state should be pulled up to the top
 */
export function WithSelectionEditor({}: {}) {
  const selection = useSelectionAtom();

  // Atom doesn't use get or set, so it's safe to be synthetic and different every render?
  const docNodeAtom = useRef(
    atom<RaisinDocumentNode, SetStateAction<RaisinDocumentNode>>(
      (get) => {
        const node = get(SelectedNodeAtom) as RaisinElementNode;
        return {
          type: ElementType.Root,
          children: node.children,
        };
      },
      (get, set, next) => {
        set(RootNodeAtom, (prev) => {
          const path = get(SelectedAtom)?.path;
          const node = get(SelectedNodeAtom) as RaisinElementNode;
          if (!path) return prev;

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

  const { mountRef } = useProseEditorOnAtom(docNodeAtom, selection);

  return <div ref={mountRef} />;
}

export function useRichTextEditorForAtom() {
  const nodeAtom = (useNodeAtom() as unknown) as PrimitiveAtom<RaisinElementNode>;
  const docNodeAtom = useMemo(
    () =>
      atom<RaisinDocumentNode, SetStateAction<RaisinDocumentNode>>(
        (get) => {
          return {
            type: ElementType.Root,
            children: get(nodeAtom).children,
          };
        },
        (get, set, next) => {
          const prevNode = get(nodeAtom);
          const prevDocNode = {
            type: ElementType.Root,
            children: prevNode.children,
          } as RaisinDocumentNode;
          const nextVal = typeof next === 'function' ? next(prevDocNode) : next;
          const nextNode = {
            ...prevNode,
            children: nextVal.children,
          };
          set(nodeAtom, nextNode);
        }
      ),
    [nodeAtom]
  );
  const selection = useSelectionAtom();
  const { mountRef } = useProseEditorOnAtom(docNodeAtom, selection);
  return { mountRef };
}

/**
 * A controller for editing rich text via a Prose Editor
 *
 * @returns
 */
export function RichTextEditorForAtom() {
  const { mountRef } = useRichTextEditorForAtom();
  return <div ref={mountRef} />;
}
