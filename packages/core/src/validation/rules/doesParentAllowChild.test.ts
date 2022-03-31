import { CustomElement } from "@raisins/schema/schema";
import {
  RaisinCommentNode,
  RaisinElementNode,
  RaisinProcessingInstructionNode,
  RaisinStyleNode,
  RaisinTextNode
} from "../../html-dom/RaisinNode";
import { doesParentAllowChild } from "./doesParentAllowChild";

describe("doesParentAllowChild", () => {
  test("Parent without slots does not allow child", () => {
    const child: RaisinElementNode = {
      type: "tag",
      tagName: "",
      attribs: {},
      children: []
    };
    const parentMeta: CustomElement = {
      tagName: ""
    };
    expect(doesParentAllowChild(child, parentMeta, undefined)).toBe(false);
  });

  test("Parent does not allow child if child is not an element node", () => {
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
    const parentMeta: CustomElement = {
      tagName: "",
      slots: [{ name: "child" }]
    };
    expect(doesParentAllowChild(style, parentMeta, "child")).toBe(false);
    expect(doesParentAllowChild(text, parentMeta, "child")).toBe(false);
    expect(doesParentAllowChild(comment, parentMeta, "child")).toBe(false);
    expect(doesParentAllowChild(instruction, parentMeta, "child")).toBe(false);
  });

  test("Parent allows child when its slot specifies * as valid children", () => {
    const child: RaisinElementNode = {
      type: "tag",
      tagName: "",
      attribs: {},
      children: []
    };
    const parentMeta: CustomElement = {
      tagName: "",
      slots: [{ name: "child", validChildren: ["*"] }]
    };
    expect(doesParentAllowChild(child, parentMeta, "child")).toBe(true);
  });

  test("Parent allows child when there are no constraints on its valid children", () => {
    const child: RaisinElementNode = {
      type: "tag",
      tagName: "div",
      attribs: {},
      children: []
    };
    const parent: CustomElement = {
      tagName: "",
      slots: [{ name: "children" }]
    };
    expect(doesParentAllowChild(child, parent, "children")).toBe(true);
  });

  test("Parent allows child when its slots have constraints and matches child's tagname", () => {
    const child: RaisinElementNode = {
      type: "tag",
      tagName: "div",
      attribs: {},
      children: []
    };
    const parentMeta: CustomElement = {
      tagName: "",
      slots: [{ name: "child", validChildren: ["div"] }]
    };
    expect(doesParentAllowChild(child, parentMeta, "child")).toBe(true);
  });

  test("Parent does not allow child if its slot constraints does not match child's tagname", () => {
    const child: RaisinElementNode = {
      type: "tag",
      tagName: "span",
      attribs: {},
      children: []
    };
    const parentMeta: CustomElement = {
      tagName: "",
      slots: [{ name: "child", validChildren: ["div"] }]
    };
    expect(doesParentAllowChild(child, parentMeta, "child")).toBe(false);
  });
});
