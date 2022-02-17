import { Atom, atom, WritableAtom } from 'jotai';
import { AsyncMethodReturns, Connection, connectToChild } from 'penpal';
import { MutableRefObject } from 'react';
import type { VNode } from 'snabbdom';
import { NPMRegistry } from '../util/NPMRegistry';
import { childApiSrc } from './injected/childApiSrc';
import {
  CanvasEvent,
  ChildRPC,
  GeometryDetail,
  ParentRPC,
} from './api/_CanvasRPCContract';

const iframeSrc = (head: string, registry: NPMRegistry, selector: string) => `
<!DOCTYPE html>
<html>
<head>
  ${head}
  ${childApiSrc(registry, selector)}
</head>
<body></body>
</html>`;

function renderInChild(child: AsyncMethodReturns<ChildRPC>, Comp: VNode): void {
  if (!Comp) return; // no Component yet
  child.render(Comp);
}

export type ConnectionState =
  | { type: 'uninitialized' }
  | { type: 'initializing'; connection: Connection<ChildRPC> }
  | { type: 'loaded'; childRpc: AsyncMethodReturns<ChildRPC>; connection: Connection<ChildRPC> }
  | { type: 'error'; error: unknown; connection: Connection<ChildRPC> };

export function createAtoms(props: {
  vnodeAtom: Atom<VNode>;
  head: Atom<string>;
  selector: Atom<string>;
  registry: Atom<NPMRegistry>;
  onEvent: WritableAtom<null, CanvasEvent>;
  onResize: WritableAtom<null, GeometryDetail>;
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

  const iframeAtom = createIframeAtom(containerAtom, iframeSource);

  const connectionAtom = atom<Atom<ConnectionState>>((get) => {
    const iframe = get(iframeAtom);
    if (!iframe) return atom({ type: 'uninitialized' });

    const internalState = atom<ConnectionState>({ type: 'uninitialized' });

    type ConnectionRef = MutableRefObject<Connection<any> | null>;

    /**
     * Based on https://jotai.org/docs/guides/no-suspense
     */
    const penpalStateAtom = atom(
      (get) => get(internalState),
      (_, set, connectionRef: ConnectionRef) => {
        const parentRPC: ParentRPC = {
          resizeHeight(pixels) {
            iframe.height = pixels;
          },
          event(e) {
            set(props.onEvent, e);
          },
          geometry(detail) {
            set(props.onResize, detail);
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
        // for atom `onMount` cleanup
        connectionRef.current = connection;
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
      const connectionRef: ConnectionRef = {
        current: null,
      };
      start(connectionRef);
      return () => {
        // cleanup
        connectionRef.current?.destroy();
      };
    };

    return penpalStateAtom;
  });

  const lastRenderedComponent = atom<VNode | undefined>((get) => {
    const whichConnected = get(connectionAtom);
    const connectionStatus = get(whichConnected);
    if (connectionStatus.type !== 'loaded') return undefined;

    const component = get(props.vnodeAtom);
    renderInChild(connectionStatus.childRpc, component);
    return component;
  });

  const external = atom(
    (get) => {
      // Subscribes and does nothing
      get(lastRenderedComponent);
      return get(get(connectionAtom));
    },
    (_, set, el: HTMLElement | null) => {
      set(containerAtom, el);
    }
  );

  return external;
}

function createIframeAtom(
  containerAtom: Atom<HTMLElement | null>,
  iframeSource: Atom<string>
) {
  const mutableIframeRefAtom = atom(() => ({} as { prev?: HTMLIFrameElement }));

  const iframeAtom = atom<HTMLIFrameElement | undefined>((get) => {
    const el = get(containerAtom);
    const mutableIframeRef = get(mutableIframeRefAtom);
    // Always cleans up the previous iframe.
    //  When there is a new iframe
    //  Then always remove the old one
    mutableIframeRef.prev &&
      mutableIframeRef.prev.parentElement?.removeChild(mutableIframeRef.prev);
    if (!el) {
      mutableIframeRef.prev = undefined;
      return undefined;
    }
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

    mutableIframeRef.prev = iframe;
    return iframe;
  });
  return iframeAtom;
}
