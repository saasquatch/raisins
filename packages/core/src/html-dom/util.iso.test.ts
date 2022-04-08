import expect from "expect";
import {
  RaisinCommentNode,
  RaisinNode,
  RaisinProcessingInstructionNode,
  RaisinStyleNode,
  RaisinTextNode
} from "./RaisinNode";
import {
  clone,
  duplicate,
  getAncestry,
  insertAtPath,
  move,
  moveToPath,
  remove,
  replace,
  replacePath
} from "./util";

it("Remove node", () => {
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

it("Replace node", () => {
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

it("Duplicate node", () => {
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

it("Clone node", () => {
  const node: RaisinNode = {
    type: "tag",
    tagName: "div",
    children: [],
    attribs: {}
  };
  expect(clone(node)).toStrictEqual(node);
});

it("Get ancestry", () => {
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

it("Move", () => {
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

it("Move path", () => {
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

it("Insert at path", () => {
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

it("Replace path", () => {
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
