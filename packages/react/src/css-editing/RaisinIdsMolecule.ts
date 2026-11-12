import type { RaisinNode } from '@raisins/core';
import { htmlUtil } from '@raisins/core';
import { molecule } from 'bunshi/react';
import type { Atom } from 'jotai';
import { atom } from 'jotai';
import { CoreMolecule } from '../core/CoreAtoms.tsx';
import { RAISIN_ID_ATTR } from './RaisinCssIds.ts';

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