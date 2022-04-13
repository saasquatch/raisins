import * as schema from '@raisins/schema/schema';
import { CustomElement } from '../Component';
import { ModuleDetails } from '../types';

/**
 * Reduces a set of ModuleDetails into a set of CustomElement definitions.
 *
 */
export function moduleDetailsToTags(
  acc: schema.CustomElement[],
  c: ModuleDetails
): schema.CustomElement[] {
  // A raisins package can have multiple "modules", each with their own tags
  const tags =
    c.raisins?.modules.reduce(
      (acc1, curr) => [...acc1, ...(curr.tags ?? [])],
      [] as CustomElement[]
    ) ?? [];

  return [...acc, ...tags];
}
