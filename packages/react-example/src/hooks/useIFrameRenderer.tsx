import { useEffect, useRef, useState } from 'react';

export type UseIframeProps<C, E> = {
  /**
   * A source document to use in the iframe
   */
  src: string;
  /**
   * A function to call when the iframe is ready to render, and whenever a render occurs
   */
  renderer: (iframe: HTMLIFrameElement, Component: C) => E;
  /**
   * The component to render
   */
  initialComponent: C;
  createElement: (comp: C) => E;
};

/**
 * Creates a renderer that will render a Component into an iframe.
 *
 * This was written to be generic and not rely on Stencil in any way, and focus just on the specifics of how to create a useful iframe element.
 *
 * @param props - controls for how to render the iframe
 * @returns
 */
export function useIframeRenderer<C, E>({ src, renderer, initialComponent, createElement }: UseIframeProps<C, E>) {
  const initialComponentRef = useRef<C>(initialComponent);
  const container = useRef<HTMLElement | undefined>();
  const iframeRef = useRef<HTMLIFrameElement | undefined>();
  const [loaded, setLoaded] = useState(false);
  
  useEffect(
    () => {
      if (container.current) {
        const el = container.current;
        const iframe: HTMLIFrameElement = document.createElement('iframe');
        iframeRef.current = iframe;
        iframe.srcdoc = src;
        iframe.width = '100%';
        iframe.scrolling = 'no';
        iframe.setAttribute('style', 'border: 0; background-color: none; width: 1px; min-width: 100%;');
        // iframe.setAttribute('sandbox', 'allow-scripts');
        const loadListener = async () => {
          // iframe.height = iframe.contentDocument.body.scrollHeight + 'px';

          // Adjust frame height when size of body changes
          // @ts-ignore
          const ro = new iframe.contentWindow.ResizeObserver(entries => {
            for (const entry of entries) {
              const { height } = entry.contentRect;
              // @ts-ignore -- number will be cast to string by browsers
              iframe.height = height;
            }
          });

          ro.observe(iframe.contentDocument!.body);
          // loaded.current = true;
          setLoaded(true);
          renderer(iframe, initialComponentRef.current);
        };
        iframe.addEventListener('load', loadListener);
        el.appendChild(iframe);

        return () => {
          iframeRef.current = undefined;
          iframe.removeEventListener('load', loadListener);
          setLoaded(false);
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [src],
  );

  function renderInIframe(Component: C): E | undefined {
    initialComponentRef.current = Component;
    if (iframeRef.current && loaded) {
      const out = renderer(iframeRef.current, Component);
      if(out){
        return out;
      }
    } else {
      // Render will be called when the iframe is loaded
    }

    // return createElement(initialComponentRef.current);
  }

  return {
    loaded,
    container,
    iframeRef,
    renderInIframe,
  };
}
