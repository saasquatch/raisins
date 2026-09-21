import { htmlUtil, RaisinNode } from '@raisins/core';
import { molecule } from 'bunshi/react';
import { atom, Atom } from 'jotai';
import { CoreMolecule } from '../core/CoreAtoms';
import { RAISIN_ID_ATTR } from './RaisinCssIds';

const { visit } = htmlUtil;

export type RaisinIdsMoleculeType = {
  UsedRaisinIdsAtom: Atom<Set<string>>;
};

export const RaisinIdsMolecule = molecule(
  (getMol): RaisinIdsMoleculeType => {
    const { RootNodeAtom } = getMol(CoreMolecule);

    const UsedRaisinIdsAtom = atom(get => {
      const ids = new Set<string>();

      visit<RaisinNode>(get(RootNodeAtom), {
        onElement: element => {
          const id = element.attribs[RAISIN_ID_ATTR];
          if (typeof id === 'string' && id.length > 0) ids.add(id);
          return element;
        },
        onRoot: root => root,
      });

      return ids;
    });
    UsedRaisinIdsAtom.debugLabel = 'UsedRaisinIdsAtom';

    return { UsedRaisinIdsAtom };
  }
);