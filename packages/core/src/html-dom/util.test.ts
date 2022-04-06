import { ElementType } from "domelementtype";
import { autoBindSteps, loadFeature, StepDefinitions } from "jest-cucumber";
import {
	RaisinCommentNode, RaisinNode,
	RaisinProcessingInstructionNode,
	RaisinStyleNode,
	RaisinTextNode
} from "./RaisinNode";
import {
	clone,
	duplicate,
	getAncestry,
	IdentityVisitor,
	insertAtPath,
	move,
	moveToPath,
	remove,
	removeWhitespace,
	replace,
	replacePath,
	visit,
	visitAll
} from "./util";

const feature = loadFeature("cypress/integration/Specs/util.feature");

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
    visit(node[types], IdentityVisitor, false);
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

  // should not affect callback
  visit(node.tag, IdentityVisitor, true);
  visit(node.root, IdentityVisitor, true);

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

test("Visit all", () => {
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

  const callback = {
    callbackCounter: (_callback: any) => false
  };

  const callbackSpy = jest.spyOn(callback, "callbackCounter");

  visitAll(node, (n: RaisinNode) => {
    callback.callbackCounter(0);
    return n;
  });

  expect(callbackSpy).toBeCalledTimes(3);
});

test("Remove node", () => {
  const node: RaisinNode = {
    type: "tag",
    tagName: "div",
    children: [],
    attribs: {}
  };
  const root: RaisinNode = {
    type: "root",
    children: [node]
  };
  expect(remove(root, node)).toStrictEqual({
    type: "root",
    children: []
  });
});

test("Replace node", () => {
  const root = (child: RaisinNode): RaisinNode => {
    return {
      type: "root",
      children: [child]
    };
  };

  const span: RaisinNode = {
    type: "tag",
    tagName: "span",
    children: [],
    attribs: {}
  };

  const div: RaisinNode = {
    type: "tag",
    tagName: "div",
    children: [],
    attribs: {}
  };

  const text: RaisinTextNode = {
    type: "text",
    data: ""
  };
  
  const style: RaisinStyleNode = {
    type: "style",
    attribs: {},
    tagName: "style"
  };

  const comment: RaisinCommentNode = {
    type: "comment",
    data: ""
  };

  const code: RaisinProcessingInstructionNode = {
    type: "directive",
    name: "",
    data: ""
  };

  expect(replace(root(div), div, span)).toStrictEqual(root(span));
  expect(replace(root(text), text, span)).toStrictEqual(root(span));
  expect(replace(root(style), style, span)).toStrictEqual(root(span));
  expect(replace(root(comment), comment, span)).toStrictEqual(root(span));
  expect(replace(root(code), code, span)).toStrictEqual(root(span));
});

test("Duplicate node", () => {
  const text: RaisinTextNode = {
    type: "text",
    data: "hello world"
  };
  const node: RaisinNode = {
    type: "tag",
    tagName: "div",
    children: [text, text, text],
    attribs: { open: "true" }
  };
  const root: RaisinNode = {
    type: "root",
    children: [node]
  };
  expect(duplicate(root, node)).toStrictEqual({
    type: "root",
    children: [node, node]
  });
  expect(() => duplicate(root, root)).toThrowError();
  expect(() => duplicate(node, node)).toThrowError();
});

test("Clone node", () => {
  const node: RaisinNode = {
    type: "tag",
    tagName: "div",
    children: [],
    attribs: {}
  };
  expect(clone(node)).toStrictEqual(node);
});

test("Get ancestry", () => {
  const root: RaisinNode = {
    type: "root",
    children: []
  };

  const node: RaisinNode = {
    type: "tag",
    tagName: "div",
    children: [],
    attribs: {}
  };
  expect(getAncestry(root, node)).toStrictEqual([]);
});

test("Move", () => {
  const node: RaisinNode = {
    type: "tag",
    tagName: "span",
    children: [],
    attribs: {}
  };
  const newParent: RaisinNode = {
    type: "tag",
    tagName: "div",
    children: [node],
    attribs: {}
  };
  const root: RaisinNode = {
    type: "root",
    children: [newParent]
  };

  expect(move(root, node, newParent, 0)).toStrictEqual(root);
  expect(() => move(root, root, newParent, 0)).toThrowError();
  expect(() => move(root, node, node, 0)).toThrowError();
});

test("Move path", () => {
  const root: RaisinNode = {
    type: "root",
    children: [
      {
        type: "tag",
        tagName: "div",
        children: [{ type: "tag", tagName: "span", children: [], attribs: {} }],
        attribs: {}
      }
    ]
  };

  expect(() => moveToPath(root, [0], [0], 0)).toThrowError();
  expect(() => moveToPath(root, [1], [1], 0)).toThrowError();
  expect(moveToPath(root, [0], [1], 2)).toStrictEqual({
    type: "root",
    children: []
  });
});

test("Insert at path", () => {
  const node: RaisinNode = {
    type: "tag",
    tagName: "span",
    children: [],
    attribs: {}
  };

  const root: RaisinNode = {
    type: "root",
    children: [node]
  };

  expect(() => insertAtPath(root, root, [0], 0)).toThrowError();
  expect(() => insertAtPath(root, node, [0], 0)).toThrowError();

  const rootNode = (num: number): RaisinNode => {
    return {
      type: "root",
      children: [
        {
          type: "tag",
          tagName: "div",
          children: Array(num).fill(node),
          attribs: {}
        }
      ]
    };
  };

  expect(insertAtPath(rootNode(1), node, [0], 0)).toStrictEqual(rootNode(2));
});

test("Replace path", () => {
  const node: RaisinNode = {
    type: "tag",
    tagName: "div",
    children: [],
    attribs: {}
  };

  const root: RaisinNode = {
    type: "root",
    children: [node]
  };

  expect(replacePath(root, [], node)).toStrictEqual(node);
  expect(replacePath(root, [0], node)).toStrictEqual(root);
  expect(replacePath(root, [0, 1], node)).toStrictEqual(root);
  expect(() => replacePath(root, [0, 1, 2], node)).toThrowError();
});
