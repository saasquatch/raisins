import csstree from 'css-tree';

/**
 * Parses a CSS expression and returns a pure js object AST representation of the content
 *
 * @returns
 */
export function parser(css: string): csstree.CssNodePlain {
  var obj = csstree.parse(css, {});
  const plain = csstree.toPlainObject(obj);
  // Without this stringify->parse loop, there ends up being mutable references
  const extraPlain = JSON.parse(JSON.stringify(plain));
  return extraPlain;
}

export default parser;