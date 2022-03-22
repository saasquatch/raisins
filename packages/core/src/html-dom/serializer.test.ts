import { ElementType } from "domelementtype";
import glob from "glob-promise";
import fs from "mz/fs";
import { parse } from "./parser";
import { RaisinElementNode } from "./RaisinNode";
import serializer from "./serializer";
import { isHtmlEquivalent } from "./testing/isHtmlEquivalent";

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
   * A round-trip through Raisins + parse5
   * should match a round trip through just parse5
   */
  const raisinNode = parse(html, { cleanWhitespace: false });
  const raisinString = serializer(raisinNode);
  isHtmlEquivalent(html, raisinString);
}
