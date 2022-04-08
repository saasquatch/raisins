/*

Important!

Since this file is used to generate serialized code from this function, it can only import types, not values.

*/
import type PenpalType from 'penpal';
import type * as SnabbdomType from 'snabbdom';
import type { Module, VNode } from 'snabbdom';
import type {
  ChildRPC,
  GeometryEntry,
  ParentRPC,
} from '../api/_CanvasRPCContract';
import type { Props } from './childApiSrc';

type Snabbdom = typeof SnabbdomType;
type Penpal = typeof PenpalType;

declare var props: Props;
declare var snabbdom: Snabbdom;
declare var Penpal: Penpal;

export const ChildAPIModule: string = function RaisinsChildAPI() {
  let currentNode: VNode | HTMLElement = document.body;

  const geometryEvent = 'sq:geometry';

  function isElement(value: any): value is HTMLElement {
    return value instanceof window.HTMLElement;
  }

  function getAttributes(el: HTMLElement) {
    return el.getAttributeNames().reduce((acc, attrName) => {
      return Object.assign({}, acc, {
        [attrName]: el.getAttribute(attrName),
      });
    }, {});
  }

  // @ts-ignore - fails only for build, not local dev
  const resizeObserver = new window.ResizeObserver(
    (entries: ResizeObserverEntry[]) => {
      document.body.dispatchEvent(
        new CustomEvent(geometryEvent, {
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
    }
  );

  const resizeModule: Module = {
    create: function (empty, next) {
      isElement(next.elm) && resizeObserver.observe(next.elm);
    },
    destroy: function (old) {
      isElement(old.elm) && resizeObserver.unobserve(old.elm);
    },
  };
  const patch = snabbdom.init([
    // Init patch function with chosen modules
    resizeModule,
    snabbdom.propsModule,
    snabbdom.classModule,
    snabbdom.attributesModule,
    snabbdom.styleModule,
    snabbdom.datasetModule,
  ]);

  function patchAndCache(next: VNode) {
    patch(currentNode, next);
    currentNode = next;
  }
  window.addEventListener('DOMContentLoaded', function () {
    const methods: ChildRPC = {
      render(content) {
        patchAndCache(content);
      },
      geometry() {
        if (isElement(currentNode)) {
          // No VNode rendered yet
          return {
            entries: [],
          };
        }

        function children(
          start: HTMLElement[],
          n: VNode | string
        ): HTMLElement[] {
          if (typeof n === 'string') return [];
          if (n.children) {
            const childArray = n.children.reduce(children, start);
            if (isElement(n.elm)) childArray.push(n.elm);
            return childArray;
          }
          if (isElement(n.elm)) start.push(n.elm);
          return start;
        }
        return {
          entries: children([], currentNode).map((e) => {
            return {
              contentRect: e.getBoundingClientRect(),
              target: {
                attributes: getAttributes(e),
              },
            };
          }),
        };
      },
    };
    let myConnection = (window as any).Penpal.connectToParent({
      // Methods child is exposing to parent
      methods,
    });

    myConnection.promise.then(function (parent: ParentRPC) {
      // @ts-ignore - fails only for build, not local dev
      const ro = new window.ResizeObserver(function (
        entries: ResizeObserverEntry[]
      ) {
        parent.resizeHeight(entries[0].contentRect.height + '');
      });
      ro.observe(document.body);

      document.addEventListener(geometryEvent, (e: Event) =>
        parent.geometry((e as CustomEvent).detail)
      );

      function sendEventToParent(e: Event) {
        const target = e.target;
        if (!isElement(target)) return;
        let elementTarget: HTMLElement | undefined;
        if (target.matches(props.selector)) {
          elementTarget = target;
        } else {
          const closestParent = target.closest(props.selector);
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
  });
}.toString();
