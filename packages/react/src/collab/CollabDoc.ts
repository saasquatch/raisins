import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';
import connectedAtom from '../util/atoms/connectedAtom';

export const CollabMolecule = molecule((getMol, getScope) => {
  const docAtom = atom(new Y.Doc());

  const connectionState = atom(false);
  const providerAtom = connectedAtom<WebrtcProvider>(
    (get, set) => {
      const provider = new WebrtcProvider(
        'raisins-demo-awareness-room',
        get(docAtom)
      );

      provider.awareness.setLocalStateField('user', {
        name: 'User' + Math.random(),
      });
      const listener = () => {
        console.log('New state', get(awarenessAtom)?.getStates());
        set(awarenessTick, (i) => i + 1);
      };
      provider.awareness?.on('change', listener);
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

  const usernameAtom = atom('User' + Math.random());
  const loginAtom = atom(null, (get, set) => {
    get(awarenessAtom)?.setLocalStateField('user', {
      name: get(usernameAtom),
    });
  });

  const usersAtom = atom((get) => {
    const values = get(awarenessStateAtom)?.values();
    if (!values) return [];
    const users = Array.from(values).map((s) => s?.user?.name);
    console.log('New users', users, values);
    return users;
  });

  return {
    providerAtom,
    connectionState,
    usersAtom,
    loginAtom,
  };
});
