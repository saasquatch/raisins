import { connectToChild } from 'penpal';
import { useEffect, useRef, useState } from 'react';
import { VNode } from 'snabbdom';

type NPMDependency = {
  package: string;
  version?: string;
  filePath?: string;
};

export type UseIframeProps<C> = {
  /**
   * A source document to use in the iframe
   */
  dependencies?: NPMDependency[];
  /**
   * A function to call when the iframe is ready to render, and whenever a render occurs
   */
  renderer: (iframe: HTMLIFrameElement, child: ChildRPC, Component: C) => void;

  onClick(id: string): void;

  /**
   * The head, used for scripts and styles. When changed will reload the iframe.
   */
  head: string;

  /**
   * The component to render
   */
  initialComponent: C;
};

export type ParentRPC = {
  resizeHeight(pixels: string): void;
  clicked(id: string): void;
};

export type ChildRPC = {
  render(html: VNode): void;
};

// TODO: Extract raisins-id as a constant -- also make configurable?
const childApiSrc = `
<script src="https://unpkg.com/penpal/dist/penpal.min.js"></script>
<script type="module">
import { init, classModule, attributesModule, styleModule, datasetModule, h } from "https://unpkg.com/snabbdom@3.1.0/build/index.js"

const patch = init([
  // Init patch function with chosen modules
  classModule, // makes it easy to toggle classes
  attributesModule, // for setting attributes on DOM elements
  styleModule, // handles styling on elements with support for animations
  datasetModule
]);

let prev = document.body;
function patchAndCache(next){
	patch(prev, next);
	prev = next;
}

window.addEventListener('DOMContentLoaded',function () {

  window.myConnection = window.Penpal.connectToParent({
    // Methods child is exposing to parent
    methods: {
      render(content) {
        patchAndCache(content);
      },
    },
    debug: true
  });

  window.myConnection.promise.then(function(parent){
    const ro = new ResizeObserver(function(entries){
        // @ts-ignore -- number will be cast to string by browsers
        parent.resizeHeight(entries[0].contentRect.height);
    });
    ro.observe(document.body);
    document.body.addEventListener('click', function(e){
      if(e.target.getAttribute("raisins-id")){
        parent.clicked(e.target.getAttribute("raisins-id"));
      }else{
        const closestParent = e.target.closest("[raisins-id]");
        if(closestParent){
          parent.clicked(closestParent.getAttribute("raisins-id"));
        }
      }
    });

  });

  // End event listener
});


</script>
`;

const iframeSrc = (head: string) => `
<!DOCTYPE html>
<html>
<head>
  ${head}
  ${childApiSrc}
</head>
<body></body>
</html>`;

/**
 * Creates a renderer that will render a Component into an iframe.
 *
 * This was written to be generic and not rely on Stencil in any way, and focus just on the specifics of how to create a useful iframe element.
 *
 * @param props - controls for how to render the iframe
 * @returns
 */
export function useSandboxedIframeRenderer<C>({
  renderer,
  initialComponent,
  onClick,
  head,
}: UseIframeProps<C>) {
  // TODO: - allow scripts to be added / removed / swapped. (should re-render entire frame on script update? otherwise version updates might not properly load?)

  const initialComponentRef = useRef<C>(initialComponent);
  const container = useRef<HTMLElement | undefined>();
  const iframeRef = useRef<HTMLIFrameElement | undefined>();
  const [loaded, setLoaded] = useState(false);
  const childRef = useRef<ChildRPC>();
  useEffect(() => {
    if (container.current) {
      const el = container.current;
      const iframe: HTMLIFrameElement = document.createElement('iframe');
      iframeRef.current = iframe;
      iframe.srcdoc = iframeSrc(head);
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
        clicked(id) {
          onClick(id);
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
        .catch((e) => {});

      return () => {
        iframeRef.current = undefined;
        iframe.parentElement?.removeChild(iframe);
        connection.destroy();
        setLoaded(false);
      };
    }
    return () => {};
  }, [head]);

  function renderInIframe(Component: C): void {
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
