import { useEffect, useRef, useState } from 'react';
import { connectToChild } from 'penpal';
// @ts-ignore
import { html } from 'uhtml/esm/json';
import LayersStories from '../stories/Layers.stories';

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
  renderer: (iframe: HTMLIFrameElement, child: Child, Component: C) => string;

  onClick(id: string): void;

  /**
   * The component to render
   */
  initialComponent: C;
};
export type Child = {
  render(html: string): void;
};

const childApiSrc = `
<script src="https://unpkg.com/penpal/dist/penpal.min.js"></script>
<script type="module">
import { render, html } from 'https://cdn.skypack.dev/uhtml/json';

window.addEventListener('DOMContentLoaded',function () {

window.myConnection = window.Penpal.connectToParent({
  // Methods child is exposing to parent
  methods: {
    render(content) {
      render(document.body,content);
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
    if(e.target.dataset.id){
      parent.clicked(e.target.dataset.id);
    }else{
      parent.clicked(e.target.closest("[data-id]").dataset.id);
    }
  });

});

// End event listener
});


</script>
`;
const scripts = [
  `
<link rel="stylesheet" href="https://fast.ssqt.io/npm/@shoelace-style/shoelace@2.0.0-beta.25/dist/shoelace/shoelace.css" />
<link rel="stylesheet" href="https://fast.ssqt.io/npm/@shoelace-style/shoelace@2.0.0-beta.27/themes/dark.css" />
<script type="module" src="https://fast.ssqt.io/npm/@shoelace-style/shoelace@2.0.0-beta.25/dist/shoelace/shoelace.esm.js"></script>
<style>body{margin:0;}</style>
<!-- TODO: Script management -->
<script type="text/javascript" src="https://fast.ssqt.io/npm/@saasquatch/vanilla-components@1.0.x/dist/widget-components.js"></script>
<link href="https://fast.ssqt.io/npm/@saasquatch/vanilla-components-assets@0.0.x/icons.css" type="text/css" rel="stylesheet" />`,
];

const iframeSrc = `
<!DOCTYPE html>
<html>
<head>
  ${scripts}
  ${childApiSrc}
</head>
<style>
[rjs-selected]{
  outline: 1px solid red;
}
</style>
<body>
  <div id="root">I should go away</div>
</body>
</html>`;

/**
 * Creates a renderer that will render a Component into an iframe.
 *
 * This was written to be generic and not rely on Stencil in any way, and focus just on the specifics of how to create a useful iframe element.
 *
 * @param props - controls for how to render the iframe
 * @returns
 */
export function useSandboxedIframeRenderer<C>({ renderer, initialComponent, onClick }: UseIframeProps<C>) {
  const initialComponentRef = useRef<C>(initialComponent);
  const container = useRef<HTMLElement | undefined>();
  const iframeRef = useRef<HTMLIFrameElement | undefined>();
  const [loaded, setLoaded] = useState(false);
  const childRef = useRef<Child>();
  useEffect(
    () => {
      if (container.current) {
        const el = container.current;
        const iframe: HTMLIFrameElement = document.createElement('iframe');
        iframeRef.current = iframe;
        iframe.srcdoc = iframeSrc;
        iframe.width = '100%';
        iframe.scrolling = 'no';
        iframe.setAttribute('style', 'border: 0; background-color: none; width: 1px; min-width: 100%;');
        iframe.setAttribute('sandbox', 'allow-scripts');

        el.appendChild(iframe);
        const connection = connectToChild<Child>({
          // The iframe to which a connection should be made
          iframe,
          // Methods the parent is exposing to the child
          methods: {
            resizeHeight(pixels: string) {
              iframe.height = pixels;
            },
            clicked(id: string) {
              onClick(id);
            },
          },
          timeout: 1000,
          childOrigin: 'null',
        });
        connection.promise
          .then(async child => {
            childRef.current = child;
            setLoaded(true);
          })
          .catch(e => {});

        return () => {
          iframeRef.current = undefined;
          // iframe.removeEventListener('load', loadListener);
          setLoaded(false);
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  function renderInIframe(Component: C): void {
    initialComponentRef.current = Component;
    if (iframeRef.current && childRef.current && loaded) {
      const out = renderer(iframeRef.current, childRef.current!, Component);
    } else {
      // Render will be called when the iframe is loaded
    }

    // return createElement(initialComponentRef.current);
  }

  return {
    renderInIframe,
    loaded,
    container,
    iframeRef,
  };
}
