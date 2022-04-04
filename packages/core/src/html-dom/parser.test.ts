import { ElementType } from "domelementtype";
import { RaisinNode } from "..";
import parse from "./parser";
import serializer from "./serializer";

describe("Parse simple nodes", () => {
  function parseElement(src: string, tagName: string, attribs: any = {}) {
    test("Can parse " + src, () => {
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
    test(html, () => {
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
  
  parseSimpleNodes("<html><head></head><body><div>hello world</div></body></html>");
  
  parseSimpleNodes("<!DOCTYPE html><html><div>hello world</div></html>");
  
  parseSimpleNodes("<!DOCTYPE html><body><div>hello world</div></body>");
  
  parseSimpleNodes("<!DOCTYPE html><head></head><div>hello world</div>");
  
  parseSimpleNodes("<!DOCTYPE html><head></head><body><div>hello world</div></body>");
  
  parseSimpleNodes("<!DOCTYPE html><html><head></head><body><div>hello world</div></body></html>");
});
