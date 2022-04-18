import { atom, PrimitiveAtom, useAtomValue } from 'jotai';
import { molecule, useMolecule } from 'jotai-molecules';
import { atomWithProxy } from 'jotai/valtio';
import React from 'react';
import { VNodeStyle } from 'snabbdom';
import { bindProxyAndYMap } from 'valtio-yjs';
import { proxy } from 'valtio/vanilla';
import { CanvasController } from '../canvas';
import { SnabdomRenderer } from '../canvas/raisinToSnabdom';
import { CoreMolecule } from '../core';
import { MintComponents, mintMono } from '../examples/MintComponents';
import { BasicStory } from '../index.stories';
import { StoryMolecule } from '../StoryScope';
import connectedAtom from '../util/atoms/connectedAtom';
import { isFunction } from '../util/isFunction';
import { CollabRaisinsMolecule, YJSMolecule } from './CollabDoc';

export default {
  title: 'Collab',
};

export const SelectionCanvas = () => {
  return (
    <BasicStory
      startingHtml={mintMono}
      startingPackages={MintComponents}
      renderers={CollabSelectionMolecule}
      Molecule={CollabStoryMolecule}
    >
      <SelectionAwareness />
    </BasicStory>
  );
};

const CollabStoryMolecule = molecule((getMol) => {
  const yjsAtom = getMol(YJSMolecule);

  const stateAtom = atom({
    html: mintMono,
  });

  const sharedTextAtom = connectedAtom((get, set) => {
    const ydoc = get(yjsAtom.docAtom);
    const ymap = ydoc.getMap('rawHTML');

    const proxyRootDoc = proxy(get(stateAtom));

    // bind them
    bindProxyAndYMap(
      (proxyRootDoc as unknown) as Record<string, unknown>,
      ymap
    );
    return proxyRootDoc;
  });

  const valtioAtom = atom((get) => {
    const proxyState = get(sharedTextAtom);
    if (!proxyState) return atom(get(stateAtom));
    return atomWithProxy(proxyState);
  });

  const htmlAtom: PrimitiveAtom<string> = atom(
    (get) => {
      return get(get(valtioAtom)).html;
    },
    (get, set, next) => {
      const valtioStateAtom = get(valtioAtom);

      set(valtioStateAtom, (prev) => {
        const html = isFunction(next) ? next(prev.html) : next;
        return { html };
      });
    }
  );
  return { ...getMol(StoryMolecule), HTMLAtom: htmlAtom };
});

const CollabHtml = () => {
  const { HTMLAtom } = useMolecule(CollabStoryMolecule);
  const html = useAtomValue(HTMLAtom);
  return <pre>{html}</pre>;
};

const CollabSelectionMolecule = molecule((getMol) => {
  console.log('Create molecule');
  // FIXME: This creates a circular dependency
  // this --> raisinProps --> core --> this
  const collabAtoms = getMol(YJSMolecule);
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

const SelectionAwareness = () => {
  const colabAtoms = useMolecule(CollabRaisinsMolecule);
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
