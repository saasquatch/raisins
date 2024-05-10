/**
 * For determining how to process SetState actions
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction<T>(x: T): x is T & Function {
  return typeof x === 'function';
}
