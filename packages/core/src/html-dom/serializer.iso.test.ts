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
