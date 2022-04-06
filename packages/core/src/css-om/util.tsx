import * as Css from "css-tree";
import _ from "lodash";
import { StateUpdater } from "../util/NewState";
import { StyleNodeProps, StyleNodeWithChildren } from "./Types";

/**
 * Creates an immutable state updater for child editors
 *
 * @param props
 * @param updater
 * @returns
 */
export function createUpdater<
  Node extends Css.CssNodePlain,
  Child extends Css.CssNodePlain
>(
  props: StyleNodeProps<Node>,
  selector: (prev: Node) => Child,
  updater: (node: Node, prev: Child) => Child
): StateUpdater<Child> {
  return next => {
    const reducer = (prev: Node): Node => {
      console.log("prev1", prev);
      const prevChild = selector(prev);
      const nextVal = typeof next === "function" ? next(prevChild) : next;
        const clone = { ...prev } as Node; //mutating the children of the original node, spread operator does a shallow copy
	  // const clone = Object.assign({}, prev) // shallow
    //   const clone = JSON.parse(JSON.stringify(prev)); // deep
	// const clone = _.cloneDeep(prev)
      updater(clone, nextVal);
      console.log("prev2", prev);
      return clone;
    };
    props.setNode(reducer);
  };
}

/**
 *
 * @param setNode
 * @param idx
 * @returns
 */
export function createChildUpdater(
  setNode: StateUpdater<StyleNodeWithChildren>,
  idx: number
): StateUpdater<Css.CssNodePlain> {
  return next => {
    const reducer = (current: StyleNodeWithChildren): StyleNodeWithChildren => {
      const currentAtIdx = current.children[idx];
      const nextVal = typeof next === "function" ? next(currentAtIdx) : next;
      return {
        ...current,
        // https://stackoverflow.com/questions/38060705/replace-element-at-specific-position-in-an-array-without-mutating-it
        children: Object.assign([], current.children, { [idx]: nextVal })
      };
    };

    setNode(reducer);
  };
}
