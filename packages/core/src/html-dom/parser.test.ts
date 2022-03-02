import { ElementType } from "domelementtype";
import { RaisinNode } from "..";
import parser from "./parser";

test("Parse nodes", () => {
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

  expect(parser("<div></div>")).toStrictEqual(raisinNode("div"));
  expect(parser("<span></span>")).toStrictEqual(raisinNode("span"));
  expect(parser("<h1></h1>")).toStrictEqual(raisinNode("h1"));
  expect(parser("<p></p>")).toStrictEqual(raisinNode("p"));

  expect(parser('<img src="www.example.com"></img>')).toStrictEqual(
    raisinNode("img", { src: "www.example.com" })
  );
  expect(parser('<div class="myClass"></div>')).toStrictEqual(
    raisinNode("div", { class: "myClass" })
  );
});
