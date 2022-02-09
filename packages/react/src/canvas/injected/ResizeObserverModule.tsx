/**
 * This file exports string sources.
 * 
 * Note:
 *  - should only have `type` imports
 *  - anything else needs to be string referenced
 * 
 * 
 */
import type { Module } from 'snabbdom';

export const ResizeObserverModule:string = function (): Module {
  const resizeObserver = new ResizeObserver((entries) => {
    console.log("Resized a vnode", entries);
  });
  function isElement(value: any): value is Element {
    return value instanceof window.Element;
  }
  return {
    create(empty, next) {
      isElement(next.elm) && resizeObserver.observe(next.elm);
    },
    destroy(old) {
      isElement(old.elm) && resizeObserver.observe(old.elm);
    }
  };
}.toString();

