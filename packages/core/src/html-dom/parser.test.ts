import { ElementType } from "domelementtype";
import { RaisinNode } from "..";
import parse from "./parser";

describe("Parse", () => {
  const values: boolean[] = [true, false];

  for (let value of values) {
    test("using browser native: " + value, () => {
      function raisinNode(tagName: string, attribs: any = {}): RaisinNode {
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
        return node;
      }

      expect(parse("<div></div>", { domParser: value })).toStrictEqual(
        raisinNode("div")
      );
      expect(parse("<span></span>", { domParser: value })).toStrictEqual(
        raisinNode("span")
      );
      expect(parse("<h1></h1>", { domParser: value })).toStrictEqual(
        raisinNode("h1")
      );
      expect(parse("<p></p>", { domParser: value })).toStrictEqual(
        raisinNode("p")
      );

      expect(
        parse('<img src="www.example.com"></img>', { domParser: value })
      ).toStrictEqual(raisinNode("img", { src: "www.example.com" }));
      expect(
        parse('<div center class="myClass"></div>', { domParser: value })
      ).toStrictEqual(raisinNode("div", { center: "", class: "myClass" }));
    });
  }
});
