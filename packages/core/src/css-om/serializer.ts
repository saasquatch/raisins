import { CssNodePlain, fromPlainObject, generate } from "css-tree";

/**
 * Converts a plain CSS node AST into a css string
 *
 * @param cssNode
 * @returns
 */
export function serializer(cssNode: CssNodePlain) {
  // Uses the extra plain clone to ensure `css-tree` doesn't mutate the static objects
  const clone = JSON.parse(JSON.stringify(cssNode));
  return generate(fromPlainObject(clone), {});
}

export default serializer;
