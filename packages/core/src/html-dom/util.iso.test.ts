import expect from "expect";
import { NodePath } from "../paths/Paths";
import { calculatePlopTargets } from "../validation/calculatePlopTargets";
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

  const emptyRoot: RaisinDocumentNode = {
    type: "root",
    children: []
  };

  const possiblePlopMeta = {
    title: "Div",
    tagName: "div",
    attributes: [],
    slots: []
  };

  const newNode: RaisinElementNode = {
    tagName: "div",
    attribs: { id: "newNode" },
    children: [],
    type: "tag"
  };

  it("Adding a slot to root", () => {
    const nodepath: NodePath = [];
    const plopTargets = calculatePlopTargets(
      emptyRoot,
      {
        // @ts-ignore
        tagName: undefined,
        title: undefined,
        slots: []
      },
      {
        pickedNode: newNode,
        possiblePlopMeta
      },
      {}
    );

    expect(plopTargets.length).toBe(1);

    const res = moveNode(
      emptyRoot,
      newNode,
      "",
      nodepath,
      1
    ) as RaisinDocumentNode;

    expect(res.children.length).toBe(1);
    expect(res.children[0]).toStrictEqual(newNode);
  });

  const slotRoot: RaisinDocumentNode = {
    type: "root",
    children: [node2]
  };

  const node2Moved: RaisinElementNode = {
    tagName: "div",
    attribs: { slot: "formData", id: "node2" },
    children: [],
    type: "tag"
  };

  // Moving a component with no slot name attached into a named slot
  /**
   * Before:
   *  <my-field></my-field>
   *  <my-form></my-form>
   *
   * After:
   *   <my-form>
   *     <my-field slot="formData"></my-field>
   *   </my-form>
   */
  it("Move an existing node into a slot", () => {
    const nodepath: NodePath = [];
    const res = moveNode(
      slotRoot,
      node2,
      "formData",
      nodepath,
      0
    ) as RaisinDocumentNode;

    expect(res.children.length).toBe(1);
    expect(res.children[0]).toStrictEqual(node2Moved);
  });

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

  // Moving a component with a slot name into a new slot within the same component
  /**
   * Before:
   *  <my-form>
   *    <my-field slot="formData"></my-field>
   *  </my-form>
   *
   * After:
   *   <my-form>
   *     <my-field slot="terms"></my-field>
   *   </my-form>
   */
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

  const addingNoSlotNode: RaisinElementNode = {
    tagName: "div",
    attribs: { id: "movingNode" },
    children: [],
    type: "tag"
  };

  const addedNode: RaisinElementNode = {
    tagName: "div",
    attribs: { slot: "otherChildren", id: "movingNode" },
    children: [],
    type: "tag"
  };

  // Moving a new component without a slot name into the same slot as an existing component
  /**
   * Component Added: <my-other-field></my-other-field>
   *
   * Before:
   *  <my-form>
   *    <my-field slot="formData"></my-field>
   *  </my-form>
   *
   * After:
   *   <my-form>
   *     <my-field slot="formData"></my-field>
   *     <my-other-field slot="formData"></my-other-field>
   *   </my-form>
   */
  it("Move a new node as a sibling with a different slot to a specific index", () => {
    const nodepath: NodePath = [];
    const res = moveNode(
      multiSlotRoot,
      addingNoSlotNode,
      "otherChildren",
      nodepath,
      1
    ) as RaisinDocumentNode;
    expect(res.children.length).toBe(2);
    expect(res.children[0]).toStrictEqual(existingNode);
    expect(res.children[1]).toStrictEqual(addedNode);
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

  // Moving a new component with a slot name into a slot within the same component as an existing component
  /**
   * Component Added: <my-other-field slot="terms"></my-other-field>
   *
   * Before:
   *  <my-form>
   *    <my-field slot="formData"></my-field>
   *  </my-form>
   *
   * After:
   *   <my-form>
   *     <my-field slot="formData"></my-field>
   *     <my-other-field slot="formData"></my-other-field>
   *   </my-form>
   */
  it("Move a new node as a sibling with a different slot to a specific index", () => {
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
    attribs: { id: "node2" },
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

  // Moving a child component to a new index within a parent component
  /**
   * Component Added: <my-field></my-field>
   *
   * Before:
   *  <parent>
   *    <child id="1" />
   *    <child id="2" />
   *    <child id="3" />
   *  </parent>
   *
   * After:
   *  <parent>
   *    <child id="2" />
   *    <child id="1" />
   *    <child id="3" />
   *  </parent>
   */
  it("Move node with no slot to a new index", () => {
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
