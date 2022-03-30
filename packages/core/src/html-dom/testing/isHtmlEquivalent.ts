import * as css5 from "css";
import * as parse5 from "parse5";
import expect from "expect";

/**
 * Validates CSS
 */
interface css5Options {
  inline?: boolean;
}

function parseCSS(input: string, options?: css5Options): string {
  input = input.toLowerCase();
  if (options?.inline) input = "*{" + input + "}";
  try {
    input = css5.stringify(css5.parse(input), {
      compress: true
    });
    input = css5.stringify(css5.parse(input), {
      compress: true
    });
  } catch {
    return "";
  }
  input = input.replace(/\s+/g, "");
  if (options?.inline) input = input.slice(2, -1);
  return input;
}

/**
 * Cleans css style values from html
 */
function cleanUpCSS(html: string) {
  html = html
    .replace(/(?<=style=([\"']))(?:(?=(\\?))\2.)*?(?=\1)/gs, input =>
      parseCSS(input, { inline: true })
    )
    .replace(
      /(<style.*?>)(.*?)(<\/style>)/gs,
      (_, start, input, end) => start + parseCSS(input) + end
    );
  return html;
}

/**
 * Compares two HTML strings to see if they are equivalent
 *
 * @param expected original html string
 * @param received comparison html string
 * @returns
 */
export function isHtmlEquivalent(
  expected: string,
  received: string,
  parseOptions?: parse5.ParserOptions,
  purifyOptions?: PurifyOptions
): true | never {
  /*
   * Initial pass through parse5
   */
  expected = parse5.serialize(parse5.parse(expected, parseOptions));
  received = parse5.serialize(parse5.parse(received, parseOptions));

  /*
   * Data massage on html
   */
  expected = cleanUpCSS(expected);
  received = cleanUpCSS(received);

  /*
   * Second trip to compare
   */
  const parsedExpected = parse5.parse(expected, parseOptions);
  const parsedReceived = parse5.parse(received, parseOptions);

  /*
   * Data massage on parse5 nodes
   */
  purify(parsedExpected, purifyOptions);
  purify(parsedReceived, purifyOptions);

  /*
   * Test node equivalence with deep comparison
   */
  expect(parsedReceived).toStrictEqual(parsedExpected);

  return true;
}
interface PurifyOptions {
  ignoreComments?: boolean;
}

/*
  Absolves parse5 nodes from their sins by:
    - removing parentNode circular references
    - sorting attributes to be in the same order (if they exist)
    - removing text nodes caused by whitespaces between elements
      or containing html elements
*/
function purify(node: any, options?: PurifyOptions | undefined) {
  for (var i = 0; i < node.childNodes.length; i++) {
    var child = node.childNodes[i];
    if (child.hasOwnProperty("parentNode")) {
      delete child["parentNode"];
    }
    if (child.hasOwnProperty("attrs")) {
      child.attrs.sort(attributeCompare);
    }
    if (child.nodeName === "#text" && !/\S/.test(child.value)) {
      node.childNodes.splice(i, 1);
      i--;
    }
    if (options?.ignoreComments && child.nodeName === "#comment") {
      node.childNodes.splice(i, 1);
      i--;
    }
    if (child.hasOwnProperty("childNodes")) {
      purify(child, options);
    }
  }
}

/*
  Sort function for comparing two nodes by name
 */
function attributeCompare(a: any, b: any) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

export default isHtmlEquivalent;
