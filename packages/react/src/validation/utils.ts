import { ErrorEntry, ErrorStack } from './types';

export function getSubErrors<T>(
  stack: ErrorStack<T>,
  jsonPath: string
): ErrorStack<T> {
  return stack.filter(
    (error) =>
      error.jsonPointer === jsonPath || error.jsonPointer.startsWith(jsonPath + '/')
  );
}

export function hasSubErrors<T>(
  stack: ErrorStack<T>,
  jsonPath: string
): boolean {
  return getSubErrors(stack, jsonPath).length > 0;
}

export function removeError<T>(
  stack: ErrorStack<T>,
  jsonPath: string
): ErrorStack<T> {
  return stack.filter(
    (error) =>
      !(
        error.jsonPointer === jsonPath || error.jsonPointer.startsWith(jsonPath + '/')
      )
  );
}

export function addError<T>(
  stack: ErrorStack<T>,
  error: ErrorEntry<T>
): ErrorStack<T> {
  return [...stack, error];
}
