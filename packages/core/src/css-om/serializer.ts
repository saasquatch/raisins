import csstree from "css-tree";

/**
 * Converts a plain CSS node AST into a css string
 *
 * @param cssNode
 * @returns
 */
export function serializer(cssNode: csstree.CssNodePlain) {
  // Uses the extra plain clone to ensure `css-tree` doesn't mutate the static objects
  const clone = JSON.parse(JSON.stringify(cssNode));
  return csstree.generate(csstree.fromPlainObject(clone), {});
}

export default serializer;
