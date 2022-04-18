import { atom, useAtomValue } from 'jotai';
import { molecule, useMolecule } from 'jotai-molecules';
import React from 'react';
import { VNodeStyle } from 'snabbdom';
import { CanvasController } from '../canvas';
import { SnabdomRenderer } from '../canvas/raisinToSnabdom';
import { CoreMolecule } from '../core';
import { BasicStory } from '../index.stories';
import { CollabMolecule } from './CollabDoc';

export default {
  title: 'Collab',
};

export const SelectionCanvas = () => {
  return (
    <BasicStory
      startingHtml={`<div>One</div><div>two</div>`}
      renderers={CollabSelectionMolecule}
      StateWrapper={StateWrapperMolecule}
    >
      <SelectionAwareness />
    </BasicStory>
  );
};
const StateWrapperMolecule = molecule((getMol) => {

  return atom([]);
});

const CollabHtml = () => {
  const { valtioAsHtml } = useMolecule(CollabMolecule);
  const html = useAtomValue(valtioAsHtml);
  return <pre>{html}</pre>;
};

const CollabSelectionMolecule = molecule((getMol) => {
  console.log('Create molecule');
  // FIXME: This creates a circular dependency
  // this --> raisinProps --> core --> this
  const collabAtoms = getMol(CollabMolecule);
  const coreAtoms = getMol(CoreMolecule);
  return atom((get) => {
    const selections = get(collabAtoms.awarenessValues);
    const identifiers = get(coreAtoms.IdentifierModelAtom);

    const renderer: SnabdomRenderer = (d, n) => {
      // TODO: This needs better memoization internally
      const nodePath = identifiers.getPath(n).toString();
      // const color = 'red';
      const user = selections?.find((s) => s.selection?.toString() === nodePath)
        ?.user;
      const color = user?.color;
      console.log('Render', d, n);
      const { delayed, remove, ...rest } = d.style || {};
      const style: VNodeStyle = {
        ...rest,
        backgroundColor: color ?? 'transparent',
      };
      return {
        ...d,
        attrs: {
          ...d.attrs,
          title: nodePath + user?.name,
        },
        style,
      };
    };
    console.log('Create renderer', renderer);
    return [renderer];
  });
});
export const SelectionAwareness = () => {
  const colabAtoms = useMolecule(CollabMolecule);
  const provider = useAtomValue(colabAtoms.selectionSyncAtom);
  const users = useAtomValue(colabAtoms.awarenessValues);
  const connected = useAtomValue(colabAtoms.connectionState);
  return (
    <div>
      I am {connected ? 'connected' : 'not yet connected'}: <br />
      {users.map((s) => (
        <div style={{ color: s.user.color }}>
          User: {s.user.name ?? 'anonymous'} - ({s.selection?.toString()})
        </div>
      ))}
      <CanvasController />
      <CollabHtml />
    </div>
  );
};
