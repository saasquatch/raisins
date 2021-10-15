import { RaisinNode } from '@raisins/core';
import { PrimitiveAtom } from 'jotai';
import { focusAtom } from 'jotai/optics';
import { OpticFor } from 'optics-ts';
import { atomWithId } from './atomWithId';

const childOptic = (o: OpticFor<RaisinNode>) =>
  o.prop('children' as any).optional();

export function atomForChildren(
  nodeAtom: PrimitiveAtom<RaisinNode>
): PrimitiveAtom<RaisinNode[]> {
  return focusAtom(atomWithId(nodeAtom), childOptic);
}
