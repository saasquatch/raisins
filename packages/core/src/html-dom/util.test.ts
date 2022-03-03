import { ElementType } from "domelementtype";
import { autoBindSteps, loadFeature, StepDefinitions } from "jest-cucumber";
import { RaisinNode } from "./RaisinNode";
import { removeWhitespace, visit } from "./util";

const feature = loadFeature("./util.feature", { loadRelativePath: true });

export const removeWhitespaceSteps: StepDefinitions = ({
  given,
  when,
  then
}) => {
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

  then('it should return html "<div><div>I am a div</div></div>"', () => {
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
};

const visitSteps: StepDefinitions = ({ given, and, when, then }) => {
  const node: {
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

  given(/^the node is (.*)$/, type => {
    types = type;
  });

  and(/^the visitor has a (.*) function defined$/, callback => {
    callbacks = callback;
    callbackSpy = jest.spyOn(visitor, callbacks);
  });

  when("visit is called", () => {
    callbackResult = visit(node[types], visitor, false);
  });

  then("the callback is called with the node", () => {
    expect(callbackSpy).toBeCalledTimes(1);
  });

  and(/^the (.*) of the callback is returned$/, result => {
    results = result;
    expect(callbackResult).toBe(results);
  });
};

autoBindSteps([feature], [removeWhitespaceSteps, visitSteps]);

test("Visitor recursive", () => {
  const node: {
    tag: RaisinNode;
    root: RaisinNode;
  } = {
    tag: {
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
                  data: "hello world"
                }
              ],
              attribs: {}
            }
          ],
          attribs: {}
        }
      ]
    },
    root: {
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
                  type: "tag",
                  tagName: "div",
                  children: [
                    {
                      type: "text",
                      data: "hello world"
                    }
                  ],
                  attribs: {}
                }
              ],
              attribs: {}
            }
          ],
          attribs: {}
        }
      ]
    }
  };
  const visitor = {
    onElement: (_textNode: any) => "tag",
    onRoot: (_textNode: any) => "root"
  };

  const spyTag = jest.spyOn(visitor, "onElement");
  const spyRoot = jest.spyOn(visitor, "onRoot");

  // 1 root with 2 tag children
  visit(node.tag, visitor, true);

  // 1 root with 3 tag children
  visit(node.root, visitor, true);

  // total: 2 root calls and 5 tag calls
  expect(spyRoot).toBeCalledTimes(2);
  expect(spyTag).toBeCalledTimes(5);
});

test("Visitor skip node", () => {
  const node: RaisinNode = {
    type: "root",
    children: [
      {
        type: "tag",
        tagName: "div",
        children: [
          {
            type: "text",
            data: "hello world"
          }
        ],
        attribs: {}
      }
    ]
  };
  const visitor = {
    skipNode: (_skipNode: any) => false
  };

  const spySkip = jest.spyOn(visitor, "skipNode");

  visit(node, visitor, true);
  visit(node, visitor, false);

  expect(spySkip).toBeCalledTimes(2);
});
