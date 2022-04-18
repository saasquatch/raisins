import { ErrorEntry, ErrorStack } from './types';

export function getSubErrors<T>(
  stack: ErrorStack<T>,
  jsonPointer: string
): ErrorStack<T> {
  return stack.filter(
    (error) =>
      error.jsonPointer === jsonPointer ||
      error.jsonPointer.startsWith(jsonPointer + '/')
  );
}

export function hasSubErrors<T>(
  stack: ErrorStack<T>,
  jsonPointer: string
): boolean {
  return getSubErrors(stack, jsonPointer).length > 0;
}

export function removeError<T>(
  stack: ErrorStack<T>,
  jsonPointer: string
): ErrorStack<T> {
  return stack.filter(
    (error) =>
      !(
        error.jsonPointer === jsonPointer ||
        error.jsonPointer.startsWith(jsonPointer + '/')
      )
  );
}

export function addError<T>(
  stack: ErrorStack<T>,
  error: ErrorEntry<T>
): ErrorStack<T> {
  return [...stack, error];
}

export function addErrors<T>(
  stack: ErrorStack<T>,
  errors: ErrorStack<T>
): ErrorStack<T> {
  return [...stack, ...errors];
}
