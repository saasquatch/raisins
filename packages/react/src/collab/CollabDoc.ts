import { htmlSerializer, RaisinDocumentNode } from '@raisins/core';
import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { atomWithProxy } from 'jotai/valtio';
import { bindProxyAndYMap } from 'valtio-yjs';
import { proxy } from 'valtio/vanilla';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';
import { CoreMolecule, SelectedNodeMolecule } from '../core';
import connectedAtom from '../util/atoms/connectedAtom';

export const usercolors = [
  '#30bced',
  '#6eeb83',
  '#ffbc42',
  '#ecd444',
  '#ee6352',
  '#9ac2c9',
  '#8acb88',
  '#1be7ff',
];
const myColor = usercolors[Math.floor(Math.random() * usercolors.length)];

export const CollabMolecule = molecule((getMol, getScope) => {
  const docAtom = atom(new Y.Doc());
  const coreAtoms = getMol(CoreMolecule);
  const selectionAtoms = getMol(SelectedNodeMolecule);

  const valtioState = connectedAtom((get, set) => {
    const ydoc = get(docAtom);
    const ymap = ydoc.getMap('rootNode');

    const proxyRootDoc = proxy(get(coreAtoms.RootNodeAtom));

    // bind them
    bindProxyAndYMap(
      (proxyRootDoc as unknown) as Record<string, unknown>,
      ymap
    );

    return proxyRootDoc as RaisinDocumentNode;
  });

  const valtioToRoot = atom((get) => {
    const state = get(valtioState);
    if (!state) return;

    const root = get(coreAtoms.RootNodeAtom);
    state.children = (root as RaisinDocumentNode).children;

    return state;
  });

  const valtioAtom = atom((get) => {
    const proxyState = get(valtioState);
    if (!proxyState) return atom(get(coreAtoms.RootNodeAtom));
    return atomWithProxy(proxyState);
  });

  const valtioAsHtml = atom((get) => {
    // Subscribes to root node changes to propogate them
    get(valtioToRoot);

    const node = get(get(valtioAtom));
    const html = htmlSerializer(node);
    return html;
  });

  const connectionState = atom(false);
  const providerAtom = connectedAtom<WebrtcProvider>(
    (get, set) => {
      const provider = new WebrtcProvider(
        'raisins-demo-awareness-room',
        get(docAtom)
      );

      provider.awareness.setLocalStateField('user', {
        name: 'User' + Math.random(),
        color: myColor,
      });
      const listener = () => {
        console.log('New state', get(awarenessAtom)?.getStates());
        set(awarenessTick, (i) => i + 1);
      };
      provider.awareness.on('change', listener);
      provider.on('synced', () => {
        console.log('Synched');
        set(connectionState, provider.connected);
      });

      set(connectionState, provider.connected);

      // Connect only after all the listeners are set up
      provider.connect();

      return provider;
    },
    (val) => val?.destroy()
  );
  const awarenessAtom = atom((get) => get(providerAtom)?.awareness);

  const awarenessStateAtom = atom((get) => {
    get(awarenessTick);
    // For memoization, returns a copy of the map for downstream
    return new Map(get(providerAtom)?.awareness.getStates());
  });

  const awarenessTick = atom(0);

  const usersAtom = atom((get) => {
    return get(awarenessValues).map((s) => s?.user);
  });
  const awarenessValues = atom((get) => {
    const values = get(awarenessStateAtom)?.values();
    if (!values) return [];
    return Array.from(values);
  });
  const selectionSyncAtom = atom((get) => {
    const awareness = get(awarenessAtom);
    const selection = get(selectionAtoms.SelectedAtom);
    if (!awareness) return;
    awareness.setLocalStateField('selection', selection?.path);
  });

  return {
    providerAtom,
    awarenessStateAtom,
    selectionSyncAtom,
    connectionState,
    usersAtom,
    awarenessValues,
    valtioAsHtml,
  };
});
