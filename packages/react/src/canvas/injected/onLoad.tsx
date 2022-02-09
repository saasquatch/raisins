/**
 * This file exports string sources.
 *
 * Note:
 *  - should only have `type` imports
 *  - anything else needs to be string referenced
 *
 *
 */
import type { ChildRPC, ParentRPC } from '../_CanvasRPCContract';

declare var selector: string;

export const onLoadScript: string = function () {
  const methods: ChildRPC = {
    render(content) {
      // @ts-ignore
      patchAndCache(content);
    },
  };
  let myConnection = (window as any).Penpal.connectToParent({
    // Methods child is exposing to parent
    methods,
  });

  myConnection.promise.then(function (parent: ParentRPC) {
    const ro = new ResizeObserver(function (entries) {
      parent.resizeHeight(entries[0].contentRect.height + '');
    });
    ro.observe(document.body);

    function getAttributes(el: HTMLElement) {
      return el.getAttributeNames().reduce((acc, attrName) => {
        return {
          ...acc,
          [attrName]: el.getAttribute(attrName),
        };
      }, {});
    }
    function sendEventToParent(e: Event) {
      function isElement(value: any): value is HTMLElement {
        return value instanceof window.HTMLElement;
      }
      const target = e.target;
      if (!isElement(target)) return;
      let elementTarget: HTMLElement | undefined;
      if (target.matches(selector)) {
        elementTarget = target;
      } else {
        const closestParent = target.closest(selector);
        if (!isElement(closestParent)) return;
        if (closestParent) {
          elementTarget = closestParent;
        } else {
          elementTarget = undefined;
        }
      }
      parent.event({
        type: e.type,
        target: elementTarget && {
          attributes: getAttributes(elementTarget),
          rect: elementTarget.getBoundingClientRect(),
        },
      });
    }
    // Listen for all event types
    Object.keys(window).forEach((key) => {
      if (/^on/.test(key)) {
        window.addEventListener(key.slice(2), sendEventToParent);
      }
    });
  });
}.toString();
