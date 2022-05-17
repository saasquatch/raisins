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
  /**
   * Tracks when a render is active to prevent events mid-render
   */
  let rendering: boolean = false;
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
      const elements = entries.map((e) => e.target);
      dispatchResize(elements);
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

  function dispatchResize(elements: Element[]) {
    document.body.dispatchEvent(
      new CustomEvent(geometryEvent, {
        bubbles: true,
        detail: {
          entries: elements.map((e) => {
            const mappedEntry: GeometryEntry = {
              contentRect: e.getBoundingClientRect(),
              target: isElement(e)
                ? {
                    attributes: getAttributes(e),
                  }
                : undefined,
            };
            return mappedEntry;
          }),
        },
      })
    );
  }

  function patchAndCache(next: VNode) {
    rendering = true;
    try {
      patch(currentNode, next);
    } catch (e) {
      throw e;
    } finally {
      rendering = false;
    }
    currentNode = next;
  }
  window.addEventListener('DOMContentLoaded', function () {
    const methods: ChildRPC = {
      render(content) {
        try {
          patchAndCache(content);
        } catch (e) {
          document.body.innerHTML = `<div style="color:red; width: 300px; margin: 0 auto;"><b>Canvas Render Error</b><details>${e}</details></div><hr/>`;
          console.error(
            'Canvas render error',
            e,
            'rendering content',
            content,
            'into currentNode',
            currentNode
          );
          throw e;
        } finally {
          dispatchResizeAll();
        }
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
        // Adds 5 pixels of padding to support hover/selection states
        const height = entries[0].contentRect.height + 5 + '';
        parent.resizeHeight(height);
      });
      ro.observe(document.body);

      document.addEventListener(geometryEvent, (e: Event) =>
        parent.geometry((e as CustomEvent).detail)
      );
      dispatchResizeAll();

      function sendEventToParent(e: Event) {
        if (rendering) return;
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
      // Listen for all event types requested
      props.events.forEach((key) => {
        window.addEventListener(key, sendEventToParent);
      });
    });
  });

  function dispatchResizeAll() {
    dispatchResize(Array.from(document.querySelectorAll('*')));
  }
}.toString();
