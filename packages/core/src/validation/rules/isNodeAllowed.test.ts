import { CustomElement } from "@raisins/schema/schema";
import { RaisinElementNode } from "../../html-dom/RaisinNode";
import { isNodeAllowed } from "./isNodeAllowed";

describe("isNodeAllowed", () => {
  test("Node is allowed", () => {
    const child: RaisinElementNode = {
      type: "tag",
      tagName: "div",
      attribs: {},
      children: []
    };

    const childMeta: CustomElement = {
      tagName: "",
      validParents: ["*"]
    };

    const parent: RaisinElementNode = {
      type: "tag",
      tagName: "div",
      attribs: {},
      children: []
    };

    const parentMeta: CustomElement = {
      tagName: "",
      slots: [{ name: "slot", validChildren: ["*"] }]
    };

    expect(isNodeAllowed(child, childMeta, parent, parentMeta, "slot")).toBe(
      true
    );
  });
  test("Node is not allowed", () => {
    const child: RaisinElementNode = {
      type: "tag",
      tagName: "div",
      attribs: {},
      children: []
    };

    const childMeta: CustomElement = {
      tagName: "",
      validParents: ["*"]
    };

    const parent: RaisinElementNode = {
      type: "tag",
      tagName: "div",
      attribs: {},
      children: []
    };

    const parentMeta: CustomElement = {
      tagName: "",
      slots: [{ name: "slot", validChildren: ["*"] }]
    };

    expect(isNodeAllowed(child, childMeta, parent, parentMeta, "child")).toBe(
      false
    );
  });
});
