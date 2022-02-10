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
import type { GeometryEntry } from '../_CanvasRPCContract';

export const ResizeObserverModule: string = function (): Module {
  function isElement(value: any): value is HTMLElement {
    return value instanceof window.HTMLElement;
  }
  function getAttributes(el: HTMLElement) {
    return el.getAttributeNames().reduce((acc, attrName) => {
      return {
        ...acc,
        [attrName]: el.getAttribute(attrName),
      };
    }, {});
  }

  const resizeObserver = new ResizeObserver((entries) => {
    document.body.dispatchEvent(
      new CustomEvent('sq:geometry', {
        bubbles: true,
        detail: {
          entries: entries.map((e) => {
            const { target } = e;
            const mappedEntry: GeometryEntry = {
              contentRect: e.target.getBoundingClientRect(),
              target: isElement(target)
                ? {
                    attributes: getAttributes(target),
                  }
                : undefined,
            };
            return mappedEntry;
          }),
        },
      })
    );
  });

  return {
    create: function (empty, next) {
      isElement(next.elm) && resizeObserver.observe(next.elm);
    },
    destroy: function (old) {
      isElement(old.elm) && resizeObserver.observe(old.elm);
    },
  };
}.toString();
