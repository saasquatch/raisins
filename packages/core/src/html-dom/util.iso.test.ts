import expect from "expect";
import { NodePath } from "../paths/Paths";
import {
  RaisinCommentNode,
  RaisinDocumentNode,
  RaisinElementNode,
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
  moveNode,
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

describe("Move nodes", () => {
  const node1: RaisinElementNode = {
    tagName: "div",
    attribs: { slot: "children", id: "node1" },
    children: [],
    type: "tag"
  };

  const node2: RaisinElementNode = {
    tagName: "div",
    attribs: { slot: "children", id: "node2" },
    children: [],
    type: "tag"
  };

  const root: RaisinDocumentNode = {
    type: "root",
    children: [node1, node2]
  };

  it("Move node at the same level", () => {
    const nodepath: NodePath = [];
    const res = moveNode(
      root,
      node2,
      "children",
      nodepath,
      0
    ) as RaisinDocumentNode;

    expect(res.children.length).toBe(2);
    expect(res.children[0]).toStrictEqual(node2);
    expect(res.children[1]).toStrictEqual(node1);
  });

  const slotRoot: RaisinDocumentNode = {
    type: "root",
    children: [node2]
  };

  const node2Moved: RaisinElementNode = {
    tagName: "div",
    attribs: { slot: "otherChildren", id: "node2" },
    children: [],
    type: "tag"
  };

  it("Move node at the same level with new slot", () => {
    const nodepath: NodePath = [];
    const res = moveNode(
      slotRoot,
      node2,
      "otherChildren",
      nodepath,
      0
    ) as RaisinDocumentNode;

    expect(res.children.length).toBe(1);
    expect(res.children[0]).toStrictEqual(node2Moved);
  });

  const movingNode: RaisinElementNode = {
    tagName: "div",
    attribs: { slot: "children", id: "movingNode" },
    children: [],
    type: "tag"
  };

  const movedNode: RaisinElementNode = {
    tagName: "div",
    attribs: { slot: "otherChildren", id: "movingNode" },
    children: [],
    type: "tag"
  };

  const existingNode: RaisinElementNode = {
    tagName: "div",
    attribs: { slot: "otherChildren", id: "existingNode" },
    children: [],
    type: "tag"
  };

  const movedExistingNode: RaisinElementNode = {
    tagName: "div",
    attribs: { slot: "children", id: "existingNode" },
    children: [],
    type: "tag"
  };

  const multiSlotRoot: RaisinDocumentNode = {
    type: "root",
    children: [existingNode]
  };

  it("Move node at the same level with new slot to a specific index of an empty slot", () => {
    const nodepath: NodePath = [];
    const res = moveNode(
      multiSlotRoot,
      existingNode,
      "children",
      nodepath,
      1
    ) as RaisinDocumentNode;

    expect(res.children.length).toBe(1);
    expect(res.children[0]).toStrictEqual(movedExistingNode);
  });

  it("Move node at the same level with new slot to a specific index", () => {
    const nodepath: NodePath = [];
    const res = moveNode(
      multiSlotRoot,
      movingNode,
      "otherChildren",
      nodepath,
      1
    ) as RaisinDocumentNode;

    expect(res.children.length).toBe(2);
    expect(res.children[1]).toStrictEqual(movedNode);
    expect(res.children[0]).toStrictEqual(existingNode);
  });

  const node1NoSlot: RaisinElementNode = {
    tagName: "div",
    attribs: { id: "node1" },
    children: [],
    type: "tag"
  };
  const node2NoSlot: RaisinElementNode = {
    tagName: "div",
    attribs: { slot: "otherChildren", id: "node2" },
    children: [],
    type: "tag"
  };
  const node3NoSlot: RaisinElementNode = {
    tagName: "div",
    attribs: { id: "node2" },
    children: [],
    type: "tag"
  };

  const slotlessRoot: RaisinDocumentNode = {
    type: "root",
    children: [node1NoSlot, node2NoSlot, node3NoSlot]
  };

  it("Move node with no slot", () => {
    const nodepath: NodePath = [];
    const res = moveNode(
      slotlessRoot,
      node1NoSlot,
      "",
      nodepath,
      2
    ) as RaisinDocumentNode;

    expect(res.children.length).toBe(3);
    expect(res.children[0]).toStrictEqual(node2NoSlot);
    expect(res.children[1]).toStrictEqual(node1NoSlot);
    expect(res.children[2]).toStrictEqual(node3NoSlot);
  });

  it("Move sibling into another sibling, then back again", () => {
    const res = moveNode(root, node2, "children", [0], 0) as any;

    const newNode2 = res.children[0].children[0];
    expect(res.children.length).toBe(1);
    expect(newNode2).toStrictEqual(node2);

    const newOriginal = moveNode(res, newNode2, "children", [], 0) as any;

    expect(newOriginal.children.length).toBe(2);
    expect(newOriginal.children[0]).toStrictEqual(node2);
    expect(newOriginal.children[1]).toStrictEqual(node1);
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
