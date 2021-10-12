import { RaisinNode } from '@raisins/core';
import { PrimitiveAtom } from 'jotai';
import { focusAtom } from 'jotai/optics';
import { OpticFor } from 'optics-ts';

const childOptic = (o: OpticFor<RaisinNode>) =>
  // @ts-expect-error - since this is an optic for all types of RaisinNode
  o.prop('children').optional([]);
export function atomForChildren(nodeAtom: PrimitiveAtom<RaisinNode>) {
  return focusAtom(nodeAtom, childOptic);
}
