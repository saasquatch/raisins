import { RaisinNode } from '@raisins/core';
import { PrimitiveAtom } from 'jotai';
import { focusAtom } from 'jotai/optics';
import { OpticFor } from 'optics-ts';

const childOptic = (o: OpticFor<RaisinNode>) =>
  // @ts-expect-error
  o.prop('children');

export function atomForChildren(nodeAtom: PrimitiveAtom<RaisinNode>) {
  return focusAtom(nodeAtom, childOptic);
}
