import { ElementType } from "domelementtype";
import glob from "glob-promise";
import fs from "mz/fs";
import * as parse5 from "parse5";
import { parse } from "./parser";
import { RaisinElementNode } from "./RaisinNode";
import serializer from "./serializer";

describe("Parse + serialize", () => {
  test("Can parse simple HTML", () => {
    const source = `<div>Example</div>`;
    const node = parse(source);
    expect(node).toMatchSnapshot();

    const out = serializer(node);

    expect(out).toBe(source);
  });

  describe("Boolean attributes", () => {
    /*

    Boolean attributes, e.g. `<details open>`

    Read these links. They're short, just read them
    
    MDN - https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#boolean_attributes
    Spec - https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes

    htmlparser2 implements this behaviour: https://github.com/fb55/htmlparser2/issues/215
    It matches the dom value you'd get for a boolean attribute (DOM returns empty string too)

    */

    function testBooleanAttributeSerializer(value: any) {
      const node: RaisinElementNode = {
        type: ElementType.Tag,
        tagName: "details",
        attribs: {
          open: value
        },
        children: [],
        style: undefined
      };
      expect(serializer(node)).toEqual(`<details open></details>`);
    }

    function testBooleanAttribute(
      input: string,
      attrValue: any,
      out: string = input
    ) {
      const node = parse(input);
      expect(node).toEqual({
        type: "root",
        children: [
          {
            type: "tag",
            tagName: "details",
            attribs: {
              open: attrValue
            },
            children: [],
            style: undefined
          }
        ]
      });
      expect(serializer(node)).toEqual(out);
    }

    test("Boolean attributes are internally empty strings", () => {
      const input = "<details open></details>";
      testBooleanAttribute(input, "");
    });
    test("Attributes represented as empty strings are converted to boolean attributes", () => {
      const input = `<details open=""></details>`;
      testBooleanAttribute(input, "", `<details open></details>`);
    });
    test("Non quoted strings are parsed as strings", () => {
      const input = `<details open=open></details>`;
      testBooleanAttribute(input, "open", `<details open="open"></details>`);
    });

    test("JS booleans are serialized", () => {
      testBooleanAttributeSerializer("");
    });
  });

  describe("Can parse HTML Benchmark cases", () => {
    const files = glob.sync(process.cwd() + "/benchmark-files/**/*.html", {
      absolute: true
    });
    expect(files?.length).toBeGreaterThan(0);
    for (const file of files) {
      test(`File ${files.indexOf(file)}: ${file}`, async () => {
        var source = await fs.readFile(file, "utf-8");
        testRaisinOutputWithParse5(source);
      });
    }
  });
});

function testRaisinOutputWithParse5(html: string) {
  /**
   * An initial round-trip through parse5 to ensure html
   * edge cases are not handled differently through two
   * different parsers
   */
  html = parse5.serialize(parse5.parse(html));

  /**
   * Strip all styles as parse5 and Raisins treat styles
   * differently.
   *
   * Raisins uses css-om to parse and validate CSS while
   * parse5 keeps the exact string.
   */
  html = cleanUpCSS(html);

  const raisinNode = parse(html, { cleanWhitespace: false });
  const raisinString = serializer(raisinNode);

  /**
   * A round-trip through Raisins + parse5
   * should match a round trip through just parse5
   */

  const parsedOriginal = parse5.parse(html);
  const parsedRaisin = parse5.parse(raisinString);

  purify(parsedOriginal);
  purify(parsedRaisin);

  // fs.writeFileSync("parsedSource.html", html);
  // fs.writeFileSync("parsedOriginal.html", parse5.serialize(parsedOriginal));
  // fs.writeFileSync("parsedRaisin.html", parse5.serialize(parsedRaisin));

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
      if (child.hasOwnProperty("attrs") && child.attrs.length > 0) {
        child.attrs.sort(attributeCompare);
      }
      if (child.hasOwnProperty("parentNode")) {
        delete child["parentNode"];
      }
      if (child.nodeName === "#text") {
        if (!/\S/.test(child.value) || /\<|&..|\>/.test(child.value)) {
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

/**
 * Strips all styles from html
 */
function cleanUpCSS(html: string) {
  html = html
    .replace(/<\s*style.*?<\W+style\s*>/gs, "<style>CSSPARSE</style>") // replaces the content between <style> tags
    .replace(/style=([\"'])(?:(?=(\\?))\2.)*?\1/gs, 'style="CSSPARSE"'); // replaces the content inside style attribs

  // TODO: Could use a third party CSS parser instead of regex

  return html;
}

describe("Parse comparison functions", () => {
  test("Attributes with different orders", () => {
    const node_a = parse5.parse("<div left center right>I am a div</div>");
    const node_b = parse5.parse("<div center right left >I am a div</div>");
    expect(node_a).toStrictEqual(node_b);

    purify(node_a, node_b);
    expect(node_a).toStrictEqual(node_b);
  });

  test("Inline styles with different syntax", () => {
    var style_a = `<div style="display: none;">I am a div</div>`;
    var style_b = `<div style='display:none'>I am a div</div>`;
    expect(parse5.parse(style_a)).not.toStrictEqual(parse5.parse(style_b));

    style_a = cleanUpCSS(style_a);
    style_b = cleanUpCSS(style_b);
    expect(parse5.parse(style_a)).toStrictEqual(parse5.parse(style_b));
  });

  test("Styles tags <style> with different syntax", () => {
    var style_a = `<style>display: none;</style>`;
    var style_b = `<style>  display: none</style>`;
    expect(parse5.parse(style_a)).not.toStrictEqual(parse5.parse(style_b));

    style_a = cleanUpCSS(style_a);
    style_b = cleanUpCSS(style_b);
    expect(parse5.parse(style_a)).toStrictEqual(parse5.parse(style_b));
  });

  test("Different whitespaces between HTML elements", () => {
    const html_a = `
    <!DOCTYPE html>
    <html>

    <body>
        <h1>My First Heading</h1>
        <p>My first paragraph.</p>
    </body>

    </html>
   `;
    const html_b = `   
   <!DOCTYPE html>
        <html>
              <body>
                  <h1>My First Heading</h1>
                  <p>My first paragraph.</p>
              </body>          </html>
  `;

    const node_a = parse5.parse(html_a);
    const node_b = parse5.parse(html_b);
    expect(node_a).not.toStrictEqual(node_b);

    purify(node_a, node_b);
    expect(node_a).toStrictEqual(node_b);
  });
});
