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
    input = "invalid-css";
    return input;
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
 * Cleans html that is not supported
 */
function cleanUpHTML(html: string) {
  html = html.replace(/noscript|textarea|iframe/g, "$&div");
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
  received: string
): true | never {
  /*
   * Initial pass through parse5
   */
  expected = parse5.serialize(parse5.parse(expected));
  received = parse5.serialize(parse5.parse(received));

  /*
   * Data massage on html
   */
  expected = cleanUpCSS(cleanUpHTML(expected));
  received = cleanUpCSS(cleanUpHTML(received));

  /*
   * Second trip to compare
   */
  const parsedExpected = parse5.parse(expected);
  const parsedReceived = parse5.parse(received);

  /*
   * Data massage on parse5 nodes
   */
  purify(parsedExpected, parsedReceived);

  /*
    Matching on exact HTML is hard.
    - attributes can use different quotes 'attr' vs "attr"
    - trailing slashes are optiona <img> vs <img />
    - whitepace in tags <li> vs <li >
    - order of attributes <li class="a" id="a"> vs <li id="a" class="a">
    - equivalent attributes <li attr=""> vs <li attr>

    Instead we confirm that we have the same number of imporant characters.
  */

  const importantCharsExpected = (expected.match(/<|>/g) || []).length;
  const importantCharsReceived = (received.match(/<|>/g) || []).length;

  expect(importantCharsReceived).toBe(importantCharsExpected);

  /*
   * Test node equivalence with deep comparison
   */
  expect(parsedReceived).toStrictEqual(parsedExpected);

  return true;
}

/*
  Absolves parse5 nodes from their sins by:
    - removing parentNode circular references
    - sorting attributes to be in the same order (if they exist)
    - removing text nodes caused by whitespaces between elements
      or containing html elements
*/
function purify(...nodes: any[]) {
  nodes.map(node => {
    for (var i = 0; i < node.childNodes.length; i++) {
      var child = node.childNodes[i];
      if (child.hasOwnProperty("parentNode")) {
        delete child["parentNode"];
      }
      if (child.hasOwnProperty("attrs")) {
        child.attrs.sort(attributeCompare);
      }
      if (child.nodeName === "#text") {
        if (!/\S/.test(child.value)) {
          node.childNodes.splice(i, 1);
          i--;
        }
      }
      if (child.hasOwnProperty("childNodes")) {
        purify(child);
      }
    }
  });
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
