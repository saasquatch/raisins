import { Atom, atom, WritableAtom } from 'jotai';
import { Connection, connectToChild } from 'penpal';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { VNode } from 'snabbdom';
import { NPMRegistry } from '../util/NPMRegistry';

type NPMDependency = {
  package: string;
  version?: string;
  filePath?: string;
};

export type UseIframeProps = {
  /**
   * A source document to use in the iframe
   */
  dependencies?: NPMDependency[];

  /**
   * Selector for event handling.
   *
   * When a DOM event occurs, the `closest` parent with this selector
   * will be the `target` for the `onEvent` callback.
   */
  selector: string;

  /**
   * Will be called for every dom event. See {@link CanvasEvent}
   *
   * @param event
   */
  onEvent(event: CanvasEvent): void;

  /**
   * The head, used for scripts and styles. When changed will reload the iframe.
   */
  head: string;

  /**
   * Registry (for loading the required inner iframe dependencies)
   */
  registry: NPMRegistry;

  /**
   * The component to render
   */
  initialComponent: VNode;
};

/**
 * DOM event from inside the canvas.
 */
export type CanvasEvent = {
  /**
   * A DOM event type.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/Events
   */
  type: string;
  /**
   * The serializable representation of the DOM Element
   * closest parent that matches the `selector`, not necessarily the
   * DOM element that triggered the event.
   */
  target?: {
    attributes: Record<string, string>;
    rect: DOMRect;
  };
};

export type ParentRPC = {
  resizeHeight(pixels: string): void;
  event(event: CanvasEvent): void;
};

export type ChildRPC = {
  render(html: VNode): void;
};

const childApiSrc = (registry: NPMRegistry, selector: string) => `
<style>
body{ margin: 0 }
</style>
<script src="${registry.resolvePath(
  {
    name: 'penpal',
    version: '6.2.1',
  },
  'dist/penpal.min.js'
)}"></script>
<script type="module">
import { init, classModule, propsModule, attributesModule, styleModule, datasetModule, h } from "${registry.resolvePath(
  {
    name: 'snabbdom',
    version: '3.1.0',
  },
  'build/index.js'
)}"

const patch = init([
  // Init patch function with chosen modules
  propsModule, // Handles props, for demo states
  classModule, // makes it easy to toggle classes
  attributesModule, // for setting attributes on DOM elements
  styleModule, // handles styling on elements with support for animations
  datasetModule,
]);

let prev = document.body;
function patchAndCache(next){
	patch(prev, next);
	prev = next;
}

window.addEventListener('DOMContentLoaded',function () {

  let myConnection = window.Penpal.connectToParent({
    // Methods child is exposing to parent
    methods: {
      render(content) {
        patchAndCache(content);
      },
    },
  });

  myConnection.promise.then(function(parent){
    const ro = new ResizeObserver(function(entries){
        // @ts-ignore -- number will be cast to string by browsers
        parent.resizeHeight(entries[0].contentRect.height);
    });
    ro.observe(document.body);
    
    function getAttributes(el){
      return el.getAttributeNames().reduce((acc, attrName)=>{
        return {
          ...acc,
          [attrName]: el.getAttribute(attrName)
        }
      }, {});
    }
    function sendEventToParent(e){
      if(e.target.nodeType !== Node.ELEMENT_NODE) return;
      let elementTarget;
      if(e.target.matches("${selector}")){
        elementTarget = e.target;
      }else{
        const closestParent = e.target.closest("${selector}");
        if(closestParent){
          elementTarget = closestParent;
        }else{
          elementTarget = undefined;
        }
      }
      parent.event({
        type: e.type,
        target: elementTarget && {
          attributes: getAttributes(elementTarget),
          rect: elementTarget.getBoundingClientRect()
        }
      })
    }
    // Listen for all event types
    Object.keys(window).forEach(key => {
      if (/^on/.test(key)) {
        window.addEventListener(key.slice(2), sendEventToParent);
      }
    });
  });

  // End event listener
});
</script>
`;

const iframeSrc = (head: string, registry: NPMRegistry, selector: string) => `
<!DOCTYPE html>
<html>
<head>
  ${head}
  ${childApiSrc(registry, selector)}
</head>
<body></body>
</html>`;

function renderInChild(child: ChildRPC, Comp: VNode): void {
  if (!Comp) return; // no Component yet
  child.render(Comp);
}

export type ConnectionState =
  | { type: 'uninitialized' }
  | { type: 'initializing'; connection: Connection<ChildRPC> }
  | { type: 'loaded'; childRpc: ChildRPC; connection: Connection<ChildRPC> }
  | { type: 'error'; error: unknown; connection: Connection<ChildRPC> };

export function createAtoms(props: {
  vnodeAtom: Atom<VNode>;
  head: Atom<string>;
  selector: Atom<string>;
  registry: Atom<NPMRegistry>;
  onEvent: WritableAtom<null, CanvasEvent>;
}) {
  /**
   * We put our iframe in here and manage it's state
   */
  const containerAtom = atom<HTMLElement | null>(null);

  /**
   * The HTML text content of the iframe
   */
  const iframeSource = atom<string>((get) => {
    const head = get(props.head);
    const selector = get(props.selector);
    const registry = get(props.registry);
    return iframeSrc(head, registry, selector);
  });

  const iframeAtom = atom<HTMLIFrameElement | undefined>((get) => {
    const el = get(containerAtom);
    if (!el) return undefined;

    const iframe: HTMLIFrameElement = document.createElement('iframe');
    iframe.srcdoc = get(iframeSource);
    iframe.width = '100%';
    iframe.scrolling = 'no';
    iframe.setAttribute(
      'style',
      'border: 0; background-color: none; width: 1px; min-width: 100%;'
    );
    iframe.setAttribute('sandbox', 'allow-scripts');
    el.appendChild(iframe);

    return iframe;
  });

  const connectionAtom = atom<Atom<ConnectionState>>((get) => {
    const iframe = get(iframeAtom);
    if (!iframe) return atom({ type: 'uninitialized' });

    const internalState = atom<ConnectionState>({ type: 'uninitialized' });

    type OnEventRef = MutableRefObject<null | ((e: CanvasEvent) => void)>;

    /**
     * Based on https://jotai.org/docs/guides/no-suspense
     */
    const penpalStateAtom = atom(
      (get) => get(internalState),
      (
        _,
        set,
        {
          connection,
          onEventRef,
        }: {
          connection: Connection<ChildRPC>;
          onEventRef: OnEventRef;
        }
      ) => {
        onEventRef!.current = (e) => {
          // Push Penpal state into atom state
          set(props.onEvent, e);
        };
        //  { type: 'uninitialized' }
        set(internalState, { type: 'initializing', connection });
        // { type: 'initializing'; connection: Connection }
        (async () => {
          try {
            const childRpc = await connection.promise;
            // { type: 'loaded'; childRpc: ChildRPC; connection: Connection }
            set(internalState, { type: 'loaded', childRpc, connection });
          } catch (error) {
            // { type: 'error'; error: Error; connection: Connection };
            set(internalState, { type: 'error', error, connection });
          }
        })();
      }
    );

    penpalStateAtom.onMount = (start) => {
      const onEventRef: OnEventRef = {
        current: null,
      };
      const parentRPC: ParentRPC = {
        resizeHeight(pixels) {
          iframe.height = pixels;
        },
        event(e) {
          // FIXME: Overridden later
          onEventRef.current && onEventRef.current(e);
        },
      };

      const connection = connectToChild<ChildRPC>({
        // The iframe to which a connection should be made
        iframe,
        // Methods the parent is exposing to the child
        methods: parentRPC,
        timeout: 1000,
        childOrigin: 'null',
      });

      start({ onEventRef, connection });
      return () => {
        // cleanup
        connection.destroy();
      };
    };

    return penpalStateAtom;
  });

  const lastRenderedComponent = atom<VNode | undefined>((get) => {
    const connection = get(get(connectionAtom));
    if (connection.type !== 'loaded') return undefined;

    const component = get(props.vnodeAtom);
    renderInChild(connection.childRpc, component);
    return component;
  });

  const external = atom(
    (get) => {
      // Subscribes
      const last = get(lastRenderedComponent);
    },
    (get, set, el: HTMLElement | null) => {
      if (!el) {
        /**
         * When `el` is null, that is a signal that React has removed our element
         *
         * Thus, we need to clean up the previous iframe that we manually attached
         */
        const frameToDestroy = get(iframeAtom);
        frameToDestroy &&
          frameToDestroy.parentElement?.removeChild(frameToDestroy);
      }
      set(containerAtom, el);
    }
  );

  return external;
}