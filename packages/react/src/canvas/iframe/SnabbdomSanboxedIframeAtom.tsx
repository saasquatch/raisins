import { Atom, atom, WritableAtom } from 'jotai';
import { createScope, molecule } from 'bunshi/react';
import { Molecule } from "bunshi/react";
import { AsyncMethodReturns, Connection, connectToChild } from 'penpal';
import { MutableRefObject } from 'react';
import type { VNode } from 'snabbdom';
import { throttle } from 'throttle-debounce';
import { NPMRegistry } from '../../util/NPMRegistry';
import {
  ChildRPC,
  GeometryDetail,
  ParentRPC,
  RawCanvasEvent,
} from '../api/_CanvasRPCContract';
import { childApiSrc } from '../injected/childApiSrc';

const iframeSrc = (
  head: string,
  registry: NPMRegistry,
  selector: string,
  events: Set<string>
) => `
<!DOCTYPE html>
<html>
<head>
  ${head}
  ${childApiSrc(registry, selector, events)}
</head>
<body style="padding:2px;"></body>
</html>`;

function renderInChild(child: AsyncMethodReturns<ChildRPC>, Comp: VNode): void {
  if (!Comp) return; // no Component yet
  child.render(Comp);
}

const FPS_60 = 1000 / 60;

export type ConnectionState =
  | { type: 'uninitialized' }
  | { type: 'initializing'; connection: Connection<ChildRPC> }
  | {
      type: 'loaded';
      childRpc: AsyncMethodReturns<ChildRPC>;
      connection: Connection<ChildRPC>;
    }
  | { type: 'error'; error: unknown; connection: Connection<ChildRPC> };

export const SnabbdomIframeScope = createScope<
  Molecule<SnabbdomIframeProps> | undefined
>(undefined);

export const SnabbdomIframeMolecule = molecule((getMol, getScope) => {
  const propsMol = getScope(SnabbdomIframeScope);
  if (!propsMol)
    throw new Error(
      'Missing SnabbdomIframeScope for SnabbdomIframeMolecule, make sure this molecule is used inside a <ScopeProvider/>'
    );
  const props = getMol(propsMol);
  return createAtoms(props);
});

export type SnabbdomIframeProps = {
  vnodeAtom: Atom<VNode>;
  head: Atom<string>;
  selector: Atom<string>;
  registry: Atom<NPMRegistry>;
  /**
   * Set of types that will be listened to in the canvas
   */
  eventTypes: Atom<Set<string>>;
  onEvent: WritableAtom<null, RawCanvasEvent>;
  onResize: WritableAtom<null, GeometryDetail>;
};

export function createAtoms(props: SnabbdomIframeProps) {
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
    const events = get(props.eventTypes);
    return iframeSrc(head, registry, selector, events);
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

  const throttledRender = throttle(
    FPS_60,
    renderInChild
  ) as typeof renderInChild;

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
