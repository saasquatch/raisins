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
      test(`File: ${file}`, async () => {
        const source = await fs.readFile(file, "utf-8");

        const node = parse(source, { cleanWhitespace: false });
        const out = serializer(node);

        const comparisonNode = parse5.parse(source);
        // const comparisonHTML = parse5serialize(comparisonNode);

        /*
          Matching on exact HTML is hard.
           - attributes can use different quotes 'attr' vs "attr"
           - trailing slashes are optiona <img> vs <img />
           - whitepace in tags <li> vs <li >
           - order of attributes <li class="a" id="a"> vs <li id="a" class="a">
           - equivalent attributes <li attr=""> vs <li attr>
           
          Instead we confirm that we have the same number of imporant characters.

          Alternatively, need to use an HTML formatter that can correct for the above errors.
        */
        const importantCharsIn = (source.match("<>") || []).length;
        const importantCharsOut = (out.match("<>") || []).length;

        expect(importantCharsOut).toBe(importantCharsIn);

        /*
          This second pass helps to make sure that we're not doing anything
          that produces downstream errors.
        */
        serializer(parse(out, { cleanWhitespace: false }));

        const comparisonOutputNode = parse5.parse(out);
        // const comparisonOutputHtml = parse5serialize(comparisonOutputNode);

        /**
         * A round-trip through Raisins + parse5
         * should match a round trip through just parse5
         */
        // expect(comparisonOutputHtml).toEqual(comparisonHTML);
        expect(comparisonOutputNode).toStrictEqual(comparisonNode);

        // TODO: An element with style=";" will produce style="" in first run, and no style attribute in second pass
        // expect(out2).toEqual(out);

        // TODO: Could use Playwright visual comparisons to confirm HTML looks the same: https://playwright.dev/docs/test-snapshots
      });
    }
  });
});


function compare(expected:parse5.Document, actual:parse5.Document){
  const pass = expected.childNodes.every((value,index)=>{
    return compareNode(value, actual.childNodes[index])
  });
  if(!pass){
    throw new Error("");
  }
}

function compareNode(expected:parse5.ChildNode, actual:parse5.ChildNode){

  expected.
}