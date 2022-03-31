import { CustomElement } from "@raisins/schema/schema";
import {
  RaisinCommentNode,
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinProcessingInstructionNode,
  RaisinStyleNode,
  RaisinTextNode
} from "../../html-dom/RaisinNode";
import { doesChildAllowParent } from "./doesChildAllowParent";

describe("doesChildAllowParent", () => {
  test("Child allows root element as parent", () => {
    const childMeta: CustomElement = {
      tagName: ""
    };

    const root: RaisinDocumentNode = {
      type: "root",
      children: []
    };
    expect(doesChildAllowParent(childMeta, root)).toBe(true);
  });

  test("Child allows all non elements as parents", () => {
    const childMeta: CustomElement = {
      tagName: ""
    };

    const style: RaisinStyleNode = {
      type: "style",
      attribs: {},
      tagName: "style"
    };
    const text: RaisinTextNode = {
      type: "text",
      data: ""
    };
    const comment: RaisinCommentNode = {
      type: "comment",
      data: ""
    };
    const instruction: RaisinProcessingInstructionNode = {
      type: "directive",
      name: "",
      data: ""
    };
    expect(doesChildAllowParent(childMeta, style)).toBe(true);
    expect(doesChildAllowParent(childMeta, text)).toBe(true);
    expect(doesChildAllowParent(childMeta, comment)).toBe(true);
    expect(doesChildAllowParent(childMeta, instruction)).toBe(true);
  });

  test("Child without constraint allows parents", () => {
    const childMeta: CustomElement = {
      tagName: "",
      validParents: undefined
    };

    const element: RaisinElementNode = {
      type: "tag",
      attribs: {},
      tagName: "",
      children: []
    };
    expect(doesChildAllowParent(childMeta, element)).toBe(true);
  });

  test("Child with * constraint allows parents", () => {
    const childMeta: CustomElement = {
      tagName: "",
      validParents: ["*"]
    };

    const element: RaisinElementNode = {
      type: "tag",
      attribs: {},
      tagName: "anything",
      children: []
    };
    expect(doesChildAllowParent(childMeta, element)).toBe(true);
  });

  test("Child element with constraints allows parent with matching tagname", () => {
    const childMeta: CustomElement = {
      tagName: "",
      validParents: ["div"]
    };

    const element: RaisinElementNode = {
      type: "tag",
      attribs: {},
      tagName: "div",
      children: []
    };
    expect(doesChildAllowParent(childMeta, element)).toBe(true);
  });

  test("Child with constraints does not allow parent without matching tagname", () => {
    const childMeta: CustomElement = {
      tagName: "",
      validParents: ["div"]
    };

    const element: RaisinElementNode = {
      type: "tag",
      attribs: {},
      tagName: "span",
      children: []
    };
    expect(doesChildAllowParent(childMeta, element)).toBe(false);
  });

  test("Child with constraint does not allow parent without tagname", () => {
    const childMeta: CustomElement = {
      tagName: "",
      validParents: ["div"]
    };

    const element: RaisinElementNode = {
      type: "tag",
      attribs: {},
      tagName: "",
      children: []
    };

    expect(doesChildAllowParent(childMeta, element)).toBe(false);
  });
});
