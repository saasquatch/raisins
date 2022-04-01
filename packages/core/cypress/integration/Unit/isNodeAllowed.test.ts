import { CustomElement } from "@raisins/schema/schema";
import { RaisinElementNode } from "../../../src/html-dom/RaisinNode";
import { isNodeAllowed } from "../../../src/validation/rules/isNodeAllowed";
import expect from "expect";

describe("isNodeAllowed", () => {
  it("Node is allowed", () => {
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
  it("Node is not allowed", () => {
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
