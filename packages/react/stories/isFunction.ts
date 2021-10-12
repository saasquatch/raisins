export function isFunction<T>(x: T): x is T & Function {
    return typeof x === 'function';
}
