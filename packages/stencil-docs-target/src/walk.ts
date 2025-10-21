export type WalkableValue = string;
export interface WalkableObject {
  [key: string]: WalkableObject | WalkableValue[];
}
/**
 * Recursively traverses an object or array, applying a callback function to each value while tracking visited keys.
 *
 * @param obj - The object or array to traverse
 * @param cb - Callback function to apply to each string value encountered
 * @param ignoreKeys - Set of keys to ignore during traversal (optional)
 *
 * @returns For strings: The result of applying the callback
 *          For arrays: An array of callback results
 *          For objects: A new object with processed keys and nested children
 *          For null/undefined: The result of applying the callback
 *
 * @example
 * ```typescript
 * const obj = {
 *   key1: "value1",
 *   key2: ["value2", "value3"],
 *   key3: { nested: "value4" }
 * };
 * walk(obj, (value) => ({ processed: value }));
 * ```
 */
export function walk(
  obj: WalkableObject | WalkableValue[],
  cb: (value: string) => object,
  ignoreKeys: Set<string> = new Set()
) {
  const newSet = new Set(ignoreKeys);
  if (obj === null || obj === undefined) return;
  if (typeof obj === 'string') return cb(obj);
  if (Array.isArray(obj)) {
    const tags = obj.filter(tag => !newSet.has(tag));
    tags.forEach(tag => newSet.add(tag));
    return tags.map(cb);
  }

  const keys = Object.keys(obj).filter(key => !newSet.has(key));
  keys.forEach(key => newSet.add(key));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return keys.reduce((prev, key): any => {
    return {
      ...prev,
      [key]: {
        children: walk(obj[key], cb, newSet),
        ...cb(key),
      },
    };
  }, {});
}
