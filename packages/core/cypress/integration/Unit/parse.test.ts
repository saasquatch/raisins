import { ElementType } from "domelementtype";
import { RaisinNode } from "../../../src/html-dom/RaisinNode";
import parse from "../../../src/html-dom/parser";
import expect from "expect";

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
