import { ElementType } from "domelementtype";
import expect from "expect";
import parse from "./parser";
import { RaisinElementNode } from "./RaisinNode";
import serializer from "./serializer";

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

  it("Boolean attributes are internally empty strings", () => {
    const input = "<details open></details>";
    testBooleanAttribute(input, "");
  });
  it("Attributes represented as empty strings are converted to boolean attributes", () => {
    const input = `<details open=""></details>`;
    testBooleanAttribute(input, "", `<details open></details>`);
  });
  it("Non quoted strings are parsed as strings", () => {
    const input = `<details open=open></details>`;
    testBooleanAttribute(input, "open", `<details open="open"></details>`);
  });

  it("JS booleans are serialized", () => {
    testBooleanAttributeSerializer("");
  });
});

describe("Attribute escaping", () => {
  /*
   *  Test cases taken from HTML spec: https://html.spec.whatwg.org/multipage/parsing.html#escapingString
   */
  function testAttribute(jsValue: string, htmlValue: string) {
    const node: RaisinElementNode = {
      type: ElementType.Tag,
      tagName: "div",
      attribs: {
        "my-attribute": jsValue
      },
      children: [],
      style: undefined
    };
    expect(serializer(node)).toEqual(`<div my-attribute="${htmlValue}"></div>`);
  }

  it(`1. Replace any occurrence of the "&" character by the string "&amp;".`, () => {
    testAttribute(
      `There is an & in this string`,
      `There is an &amp; in this string`
    );
  });
  it(`2. Replace any occurrences of the U+00A0 NO-BREAK SPACE character by the string "&nbsp;".`, () => {
    testAttribute(
      `Non breaking space -->${String.fromCharCode(160)}<--`,
      `Non breaking space -->&nbsp;<--`
    );
  });

  it(`3. If the algorithm was invoked in the attribute mode, replace any occurrences of the """ character by the string "&quot;".`, () => {
    testAttribute(`A "quoted" string`, `A &quot;quoted&quot; string`);
    testAttribute(`A 'quoted' string`, `A 'quoted' string`);
  });

  it(`4. If the algorithm was not invoked in the attribute mode, replace any occurrences of the "<" character by the string "&lt;", and any occurrences of the ">" character by the string "&gt;".`, () => {
    /**
     * We do NOT trigger parsing in "attribute mode" because we always serialize with quotes around the attribute values.
     *
     * If we wanted to serialize without quotes (then we would need to escape the <> strings (e.g. <div attr="<my-attr>"> would become <div attr=&gt;my-attr&lt;>)
     */
    testAttribute(`Less than <`, `Less than <`);
    testAttribute(`Greater than >`, `Greater than >`);
  });

  describe("Does not escape other charaters", () => {
    for (let charCode = 0; charCode < 65536; charCode++) {
      const char = String.fromCharCode(charCode);

      if (charCode === "&".charCodeAt(0)) continue;
      if (charCode === `"`.charCodeAt(0)) continue;
      if (charCode === 160) continue;
      try {
        testAttribute(`Unescaped ${char}`, `Unescaped ${char}`);
      } catch (e) {
        throw new Error(`${char} (charcode ${charCode}) is being escaped`);
      }
    }
  });
});
