import { StateUpdater } from "../util/NewState";
import * as Css from 'css-tree';
import { StyleNodeProps } from '../views/StyleEditor';

/**
 * Creates an immutable state updater for child editors
 *
 * @param props
 * @param updater
 * @returns
 */
export function createUpdater<Node extends Css.CssNodePlain, Child extends Css.CssNodePlain>(
  props: StyleNodeProps<Node>,
  selector: (prev: Node) => Child,
  updater: (node: Node, prev: Child) => Child,
): StateUpdater<Child> {
  return next => {
    props.setNode(prev => {
      const prevChild = selector(prev);
      const nextVal = typeof next === 'function' ? next(prevChild) : next;
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
    setNode(current => {
      const nextVal = typeof next === 'function' ? next(current) : next;
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
