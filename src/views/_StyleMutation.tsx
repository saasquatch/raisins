import { StateUpdater } from '../model/EditorModel';
import * as Css from 'css-tree';
import { StyleNodeProps } from './StyleEditor';

/**
 * Creates an immutable state updater for child editors
 *
 * @param props
 * @param updater
 * @returns
 */
export function createUpdater<Node extends Css.CssNodePlain, Child extends Css.CssNodePlain>(
  props: StyleNodeProps<Node>,
  updater: (prev: Node, nextVal: Child) => void,
): StateUpdater<Child> {
  return next => {
    const nextVal = typeof next === 'function' ? next() : next;
    props.setNode(prev => {
      const clone = { ...prev };
      updater(clone, nextVal);
      return clone;
    });
  };
}

/**
 *
 * @param setNode
 * @param idx
 * @returns
 */
export function createChildUpdater(setNode: StateUpdater<HasChildren>, idx: number): StateUpdater<Css.CssNodePlain> {
  return next => {
    const nextVal = typeof next === 'function' ? next() : next;
    setNode(current => {
      return {
        ...current,
        children: current.children.splice(idx, 1, nextVal),
      };
    });
  };
}
export type HasChildren = {
  children: Css.CssNodePlain[];
} & Css.CssNodePlain;
