import { useEffect, useRef, useState } from '@saasquatch/universal-hooks';

export type UseIframeProps<C> = {
  /**
   * A source document to use in the iframe
   */
  src: string;
  /**
   * A function to call when the iframe is ready to render, and whenever a render occurs
   */
  renderer: (iframe: HTMLIFrameElement, Component: C) => void;
  /**
   * The component to render
   */
  initialComponent: C;
};

/**
 * Creates a renderer that will render a Component into an iframe.
 *
 * This was written to be generic and not rely on Stencil in any way, and focus just on the specifics of how to create a useful iframe element.
 *
 * @param props - controls for how to render the iframe
 * @returns
 */
export function useIframeRenderer<C>({ src, renderer, initialComponent }: UseIframeProps<C>) {
  const initialComponentRef = useRef<C>(initialComponent);
  const container = useRef<HTMLElement>();
  const iframeRef = useRef<HTMLIFrameElement>();
  const loaded = useRef(false);

  useEffect(() => {
    if (container.current) {
      const el = container.current;
      const iframe: HTMLIFrameElement = document.createElement('iframe');
      iframeRef.current = iframe;
      iframe.srcdoc = src;
      iframe.width = '100%';
      iframe.scrolling = 'no';
      iframe.setAttribute('style', 'border: 0; background-color: none; width: 1px; min-width: 100%;');
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

        ro.observe(iframe.contentDocument.body);
        loaded.current = true;
        renderer(iframe, initialComponentRef.current);
      };
      iframe.addEventListener('load', loadListener);
      el.appendChild(iframe);

      return () => {
        iframeRef.current = undefined;
        loaded.current = false;
        iframe.removeEventListener('load', loadListener);
      };
    }
  }, [container.current, src]);

  const renderInIframe = (Component: C) => {
    if(Component === initialComponentRef.current){
      // Won't attempt to re-render exact same component
      return;
    }
    initialComponentRef.current = Component;
    if (iframeRef.current && loaded) {
      renderer(iframeRef.current, Component);
    } else {
      // Render will be called when the iframe is loaded
    }
  };

  return {
    loaded,
    container,
    iframeRef,
    renderInIframe,
  };
}
