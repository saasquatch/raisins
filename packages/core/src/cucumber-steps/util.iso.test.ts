import { ElementType } from "domelementtype";
import expect from "expect";
import { RaisinNode } from "../html-dom/RaisinNode";
import { removeWhitespace, visit } from "../html-dom/util";
import { bindIsomorphicCucumberSteps } from "./bindIsomorphicCucumberSteps";

const JEST = process.env.JEST_WORKER_ID !== undefined;

const cucumber = (
  given: (...args: any[]) => void,
  and: (...args: any[]) => void,
  when: (...args: any[]) => void,
  then: (...args: any[]) => void
) => {
  let node: RaisinNode;
  let clean: RaisinNode;
  let expected: RaisinNode;

  given("a raisin node with html", () => {
    /*
		<div>
						<div>
						I am a div
					</div>		
			</div>
    */
    // node has the above html content:
    node = {
      type: "root",
      children: [
        {
          type: "text",
          data: "\n  \t"
        },
        {
          type: "tag",
          tagName: "div",
          children: [
            {
              type: "text",
              data: "\n\t\t\t\t\t"
            },
            {
              type: "tag",
              tagName: "div",
              children: [
                {
                  type: "text",
                  data: "\n\t\t\t\t\tI am a div\n\t\t\t\t"
                }
              ],
              attribs: {}
            },
            {
              type: "text",
              data: "\t\t\n\t\t"
            }
          ],
          attribs: {}
        },
        {
          type: "text",
          data: "\n  "
        }
      ]
    };
  });

  when("we run removeWhitespace on raisin node", () => {
    clean = removeWhitespace(node);
  });

  then(/it should return html "(.*)"/, () => {
    /*
		<div><div>I am a div</div></div>
  	*/
    // expected has the above html content:
    expected = {
      type: "root",
      children: [
        {
          type: "tag",
          tagName: "div",
          children: [
            {
              type: "tag",
              tagName: "div",
              children: [
                {
                  type: "text",
                  data: "I am a div"
                }
              ],
              attribs: {}
            }
          ],
          attribs: {}
        }
      ]
    };

    expect(clean).toStrictEqual(expected);
  });

  const nodes: {
    text: RaisinNode;
    directive: RaisinNode;
    comment: RaisinNode;
    tag: RaisinNode;
    style: RaisinNode;
    root: RaisinNode;
  } = {
    text: { type: ElementType.Text, data: "Hello World" },
    directive: { type: ElementType.Directive, data: "hello", name: "world" },
    comment: { type: ElementType.Comment, data: "Hello World" },
    tag: { type: ElementType.Tag, tagName: "div", children: [], attribs: {} },
    style: { type: ElementType.Style, tagName: "style", attribs: {} },
    root: { type: ElementType.Root, children: [] }
  };

  const visitor = {
    onText: (_textNode: any) => "r_text",
    onDirective: (_directiveNode: any) => "r_directive",
    onComment: (_textNode: any) => "r_comment",
    onElement: (_textNode: any) => "r_tag",
    onStyle: (_textNode: any) => "r_style",
    onRoot: (_textNode: any) => "r_root"
  };

  let types: "text" | "directive" | "comment" | "tag" | "style" | "root";

  let callbacks:
    | "onText"
    | "onDirective"
    | "onComment"
    | "onElement"
    | "onStyle"
    | "onRoot";

  let results:
    | "r_text"
    | "r_directive"
    | "r_comment"
    | "r_tag"
    | "r_style"
    | "r_root";

  let callbackSpy: jest.SpyInstance;
  let callbackResult: string | undefined;

  given(/^the node is (.*)$/, (type: any) => {
    types = type;
  });

  and(/^the visitor has a (.*) function defined$/, (callback: any) => {
    if (JEST) {
      callbacks = callback;
      callbackSpy = jest.spyOn(visitor, callbacks);
    }
  });

  when("visit is called", () => {
    callbackResult = visit(nodes[types], visitor, false);
  });

  then("the callback is called with the node", () => {
    if (JEST) {
      expect(callbackSpy).toBeCalledTimes(1);
    }
  });

  and(/^the (.*) of the callback is returned$/, (result: any) => {
    results = result;
    expect(callbackResult).toBe(results);
  });
};

bindIsomorphicCucumberSteps(cucumber, "../html-dom/util.feature");
