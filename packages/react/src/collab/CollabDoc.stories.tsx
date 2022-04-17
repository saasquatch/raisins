import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import React from 'react';
import { CollabMolecule } from './CollabDoc';

export default {
  title: 'Collab',
};
export const SelectionAwareness = () => {
  const colabAtoms = useMolecule(CollabMolecule);
  const provider = useAtomValue(colabAtoms.providerAtom);
  const users = useAtomValue(colabAtoms.usersAtom);
  const login = useSetAtom(colabAtoms.loginAtom);
  const connected = useAtomValue(colabAtoms.connectionState);
  return (
    <div>
      I am {connected ? 'connected' : 'not yet connected'}:{' '}
      <button onClick={login}>Login</button>
      <br />
      {users.map((u) => (
        <div>User: {u ?? 'anonymous'}</div>
      ))}
    </div>
  );
};
