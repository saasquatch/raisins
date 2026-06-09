import { ElementType } from "domelementtype";
import expect from "expect";
import { ParseError, ParseErrorStack } from "./ParseError";
import parse, { parseWithErrors } from "./parser";
import { RaisinNode } from "./RaisinNode";
import serializer from "./serializer";

describe("Parse simple nodes", () => {
  function parseElement(src: string, tagName: string, attribs: any = {}) {
    it("Can parse " + src, () => {
      const node: RaisinNode = {
        type: ElementType.Root,
        children: [
          {
            type: ElementType.Tag,
            tagName: tagName,
            attribs: attribs,
            children: [],
            style: undefined
          }
        ]
      };
      expect(parse(src)).toStrictEqual(node);
    });
  }

  parseElement("<div></div>", "div");

  parseElement("<div></div>", "div");

  parseElement("<span></span>", "span");

  parseElement("<h1></h1>", "h1");

  parseElement("<p></p>", "p");

  parseElement('<img src="www.example.com"></img>', "img", {
    src: "www.example.com"
  });
  parseElement('<div center class="my-class"></div>', "div", {
    center: "",
    class: "my-class"
  });
});

describe("Parse + serialize edge cases", () => {
  function parseSimpleNodes(html: string) {
    it(html, () => {
      const raisin = parse(html);
      const raisingString = serializer(raisin);
      expect(raisingString).toBe(html);
    });
  }

  parseSimpleNodes("<div>hello world</div>");

  parseSimpleNodes("<html><div>hello world</div></html>");

  parseSimpleNodes("<body><div>hello world</div></body>");

  parseSimpleNodes("<head></head><div>hello world</div>");

  parseSimpleNodes("<head></head><body><div>hello world</div></body>");

  parseSimpleNodes(
    "<html><head></head><body><div>hello world</div></body></html>"
  );

  parseSimpleNodes("<!DOCTYPE html><html><div>hello world</div></html>");

  parseSimpleNodes("<!DOCTYPE html><body><div>hello world</div></body>");

  parseSimpleNodes("<!DOCTYPE html><head></head><div>hello world</div>");

  parseSimpleNodes(
    "<!DOCTYPE html><head></head><body><div>hello world</div></body>"
  );

  parseSimpleNodes(
    "<!DOCTYPE html><html><head></head><body><div>hello world</div></body></html>"
  );
});

describe("parseWithErrors", () => {
  describe("happy path — no errors reported", () => {
    function expectNoErrors(html: string) {
      it(html, () => {
        const result = parseWithErrors(html);
        expect(result.errors).toEqual([]);
      });
    }

    expectNoErrors("<div></div>");
    expectNoErrors('<div style="color: red"></div>');
    expectNoErrors("<style>.a { color: red; }</style>");
    expectNoErrors("");
    expectNoErrors('<div style=""></div>');
    expectNoErrors("<style></style>");
    expectNoErrors('<div style="   "></div>');
  });

  describe("happy path — recovered AST is attached", () => {
    type AstCase = {
      html: string;
      childField: "style" | "contents";
    };
    const cases: AstCase[] = [
      { html: '<div style="color: red"></div>', childField: "style" },
      { html: "<style>.a { color: red; }</style>", childField: "contents" },
      {
        html: '<div style="background-color blue"></div>',
        childField: "style"
      },
      { html: "<style>.foo { color }</style>", childField: "contents" }
    ];
    cases.forEach(({ html, childField }) => {
      it(`${html} → child.${childField} is defined`, () => {
        const result = parseWithErrors(html);
        const child = result.node.children[0] as any;
        expect(child[childField]).toBeDefined();
      });
    });
  });

  describe("error pointers", () => {
    type ErrorCase = {
      name: string;
      html: string;
      pointers: string[];
    };
    const cases: ErrorCase[] = [
      {
        name: "malformed style attribute",
        html: '<div style="background-color blue"></div>',
        pointers: ["/children/0/attribs/style"]
      },
      {
        name: "malformed <style> element",
        html: "<style>.foo { color }</style>",
        pointers: ["/children/0"]
      },
      {
        name: "attribute + element in document order",
        html: '<div style="x y"></div><style>.a { color }</style>',
        pointers: ["/children/0/attribs/style", "/children/1"]
      },
      {
        name: "sibling malformed style attributes",
        html: '<div style="a b"></div><div style="c d"></div>',
        pointers: ["/children/0/attribs/style", "/children/1/attribs/style"]
      },
      {
        name: "nested malformed style attribute",
        html: '<section><div style="bad val"></div></section>',
        pointers: ["/children/0/children/0/attribs/style"]
      },
      {
        name: "valid sibling does not produce an error",
        html: '<div style="color: red"></div><div style="bad val"></div>',
        pointers: ["/children/1/attribs/style"]
      }
    ];

    cases.forEach(({ name, html, pointers }) => {
      it(`${name}: ${html}`, () => {
        const result = parseWithErrors(html);
        expect(result.errors).toHaveLength(pointers.length);
        result.errors.forEach((entry, i) => {
          expect(entry.jsonPointer).toBe(pointers[i]);
          expect(entry.error.rule).toBe("css");
          expect(typeof entry.error.message).toBe("string");
          expect(entry.error.message.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("onParseError callback", () => {
    const inputs = [
      '<div style="bad val"></div>',
      '<div style="x y"></div><style>.a { color }</style>',
      '<section><div style="bad val"></div></section>'
    ];

    inputs.forEach(html => {
      it(`callback receives the same entries as returned errors: ${html}`, () => {
        const collected: ParseErrorStack = [];
        const result = parseWithErrors(html, {
          onParseError: (error: ParseError, jsonPointer: string) => {
            collected.push({ jsonPointer, error });
          }
        });
        expect(collected).toEqual(result.errors);
      });

      it(`returned errors populated without a callback: ${html}`, () => {
        const result = parseWithErrors(html);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe("at-least-one css error reported", () => {
    const inputs = [
      {
        name: "cleanWhitespace: true",
        html: "  <div style='bad val'></div>  ",
        options: { cleanWhitespace: true }
      },
      {
        name: "full-document with malformed <style> in <head>",
        html:
          "<!DOCTYPE html><html><head><style>.a { color }</style></head><body></body></html>"
      },
      {
        name: "full-document with malformed style attribute in <body>",
        html: '<body><div style="bad val"></div></body>'
      }
    ];

    inputs.forEach(({ name, html, options }) => {
      it(name, () => {
        const result = parseWithErrors(html, options);
        expect(result.errors.length).toBeGreaterThanOrEqual(1);
        expect(result.errors[0].error.rule).toBe("css");
      });
    });
  });

  describe("backwards compatibility with default parse", () => {
    const inputs = [
      "<div></div>",
      '<div style="bad val"></div>',
      "<style>.a { color }</style>",
      '<div style="x y"></div><style>.a { color }</style>'
    ];

    inputs.forEach(html => {
      it(`parse(html) deep-equals parseWithErrors(html).node: ${html}`, () => {
        const node = parse(html);
        const { node: nodeWithErrors } = parseWithErrors(html);
        expect(node).toStrictEqual(nodeWithErrors);
      });

      it(`parse(html) does not throw: ${html}`, () => {
        expect(() => parse(html)).not.toThrow();
      });
    });
  });

  describe("shape", () => {
    it("returns an object with exactly node and errors keys", () => {
      const result = parseWithErrors("<div></div>");
      expect(Object.keys(result).sort()).toEqual(["errors", "node"]);
    });

    it("each error entry has jsonPointer and a css error object", () => {
      const result = parseWithErrors('<div style="bad val"></div>');
      const entry = result.errors[0];
      expect(typeof entry.jsonPointer).toBe("string");
      expect(entry.error.rule).toBe("css");
      expect(typeof entry.error.message).toBe("string");
    });
  });
});
