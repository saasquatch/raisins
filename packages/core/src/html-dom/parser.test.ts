import { ElementType } from "domelementtype";
import { RaisinNode } from "..";
import parse from "./parser";

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