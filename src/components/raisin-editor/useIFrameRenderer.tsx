import { useEffect, useRef, useState } from '@saasquatch/universal-hooks';

export type UseIframeProps<C> = {
  src: string;
  renderer: (iframe: HTMLIFrameElement, Component: C) => void;
  Component: C;
};

export function useIframeRenderer<C>({ src, renderer, Component }: UseIframeProps<C>) {
  const container = useRef<HTMLElement>();
  const iframeRef = useRef<HTMLIFrameElement>();
  const [loaded, setLoaded] = useState(false);

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
        setLoaded(true);
      };
      iframe.addEventListener('load', loadListener);
      el.appendChild(iframe);

      return () => {
        iframeRef.current = undefined;
        setLoaded(false);
        iframe.removeEventListener('load', loadListener);
      };
    }
  }, [container.current, src]);

  useEffect(() => {
    if (iframeRef.current && loaded) {
      renderer(iframeRef.current, Component);
    }
  }, [iframeRef.current, Component, loaded]);
  if (iframeRef.current && loaded) {
    renderer(iframeRef.current, Component);
  }

  return {
    loaded,
    container,
    iframeRef,
  };
}
