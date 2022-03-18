import * as parse5 from "parse5";
import * as css5 from "css";

/**
 * Validates CSS
 */
interface css5Options {
  inline?: boolean;
}

function parseCSS(input: string, options: css5Options): string {
  if (options.inline) {
    input = "*{" + input + "}";
  }
  input = css5.stringify(css5.parse(input.toLowerCase()));
  input = input.slice(4, -1).replace(/\s/g, "");
  return input;
}

/**
 * Cleans css style values from html
 */
function cleanUpCSS(html: string) {
  html = html
    .replace(/(?<=<style>).*?(?=<\/style>)/gs, parseCSS)
    .replace(/(?<=style=([\"']))(?:(?=(\\?))\2.)*?(?=\1)/gs, input =>
      parseCSS(input, { inline: true })
    );
  return html;
}

export function isHtmlEquivalent(
  expected: string,
  actual: string
): true | never {
  /**
   * A round-trip through Raisins + parse5
   * should match a round trip through just parse5
   */
  const parsedOriginal = parse5.parse(cleanUpCSS(expected));
  const parsedRaisin = parse5.parse(cleanUpCSS(actual));

  /*
   * Data massage on parse5 nodes
   */
  purify(parsedOriginal, parsedRaisin);

  expect(parsedRaisin).toStrictEqual(parsedOriginal);

  // TODO: Could use Playwright visual comparisons to confirm HTML looks the same: https://playwright.dev/docs/test-snapshots

  /*
    Matching on exact HTML is hard.
    - attributes can use different quotes 'attr' vs "attr"
    - trailing slashes are optiona <img> vs <img />
    - whitepace in tags <li> vs <li >
    - order of attributes <li class="a" id="a"> vs <li id="a" class="a">
    - equivalent attributes <li attr=""> vs <li attr>

    Instead we confirm that we have the same number of imporant characters.
  */
  const importantCharsIn = (
    parse5.serialize(parsedOriginal).match(/<|>/g) || []
  ).length;
  const importantCharsOut = (parse5.serialize(parsedRaisin).match(/<|>/g) || [])
    .length;

  expect(importantCharsOut).toBe(importantCharsIn);
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
      if (child.nodeName === "#text" && !/\S/.test(child.value)) {
        node.childNodes.splice(i, 1);
        i--;
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
