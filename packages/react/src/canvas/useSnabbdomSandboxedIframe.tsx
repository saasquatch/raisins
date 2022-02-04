import { connectToChild } from 'penpal';
import { useEffect, useRef, useState } from 'react';
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

// TODO: Extract raisins-id as a constant -- also make configurable?
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

/**
 * Creates a renderer that will render a Component into an iframe.
 *
 * This was written to be independent of Raisins.
 *
 * @param props - controls for how to render the iframe
 * @returns
 */
export function useSnabbdomSandboxedIframe({
  initialComponent,
  onEvent,
  head,
  registry,
  selector,
}: UseIframeProps) {
  const initialComponentRef = useRef<VNode>(initialComponent);
  const container = useRef<HTMLElement | undefined>();
  const iframeRef = useRef<HTMLIFrameElement | undefined>();
  const [loaded, setLoaded] = useState(false);
  const childRef = useRef<ChildRPC>();

  const renderer = (
    iframe: HTMLIFrameElement,
    child: ChildRPC,
    Comp: VNode
  ): void => {
    if (!Comp) return; // no Component yet

    child.render(Comp);
  };

  useEffect(() => {
    if (container.current) {
      const el = container.current;
      const iframe: HTMLIFrameElement = document.createElement('iframe');
      iframeRef.current = iframe;
      iframe.srcdoc = iframeSrc(head, registry, selector);
      iframe.width = '100%';
      iframe.scrolling = 'no';
      iframe.setAttribute(
        'style',
        'border: 0; background-color: none; width: 1px; min-width: 100%;'
      );
      iframe.setAttribute('sandbox', 'allow-scripts');

      el.appendChild(iframe);
      const parentRPC: ParentRPC = {
        resizeHeight(pixels) {
          iframe.height = pixels;
        },
        event(e) {
          onEvent(e);
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
      connection.promise
        .then(async (child) => {
          childRef.current = child;
          renderer(iframe, childRef.current!, initialComponentRef.current);
          setLoaded(true);
        })
        .catch((e) => {
          // TODO: Capture error in state
        });

      return () => {
        iframeRef.current = undefined;
        iframe.parentElement?.removeChild(iframe);
        connection.destroy();
        setLoaded(false);
      };
    }
    return () => {};
  }, [onEvent, head, registry, selector]);

  function renderInIframe(Component: VNode): void {
    initialComponentRef.current = Component;
    if (iframeRef.current && childRef.current && loaded) {
      renderer(iframeRef.current, childRef.current!, Component);
    } else {
      // Render will be called when the iframe is loaded
    }
  }

  return {
    renderInIframe,
    loaded,
    container,
    iframeRef,
  };
}
