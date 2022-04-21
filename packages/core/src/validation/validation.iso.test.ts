import { CustomElement, Slot } from "@raisins/schema/schema";
import expect from "expect";
import { RaisinDocumentNode, RaisinNode } from "../index";
import { ComponentMetaProvider, getSlots } from "./getSlots";
import * as HTMLComponents from "./HTMLComponents";
import { DefaultSlot, DefaultSlotMeta, NamedSlot } from "./SlotModel";

describe("Slot Model", () => {
  it("Default slot types use slot interfaces", () => {
    const slot: Slot = { name: "" };
    const namedSlot: NamedSlot = {
      slot: slot
    };

    expect(typeof DefaultSlot).toBe(typeof namedSlot);
    expect(typeof DefaultSlotMeta).toBe(typeof slot);
  });
});

describe("Get Slots", () => {
  it("No slots", () => {
    const node: RaisinNode = {
      type: "tag",
      tagName: "div",
      children: [],
      attribs: {}
    };
    const meta: CustomElement = {
      tagName: ""
    };
    const getComponentMeta: ComponentMetaProvider = () => meta;

    expect(getSlots(node, getComponentMeta)).toBeTruthy();
  });

  it("Multiple slots and multiple children", () => {
    const node: RaisinNode = {
      type: "tag",
      tagName: "div",
      children: [
        { type: "tag", tagName: "div", children: [], attribs: {} },
        { type: "tag", tagName: "div", children: [], attribs: {} }
      ],
      attribs: {}
    };
    const parentMeta: CustomElement = {
      tagName: "div",
      slots: [
        { name: "slot1", validChildren: ["*"] },
        { name: "slot2", validChildren: ["div"] }
      ]
    };
    const meta: ComponentMetaProvider = () => parentMeta;

    expect(getSlots(node, meta)).toBeTruthy();
  });

  it("Root as slot", () => {
    const root: RaisinDocumentNode = {
      type: "root",
      children: []
    };
    const parentMeta: CustomElement = {
      tagName: "div",
      slots: [{ name: "slot", validChildren: ["*"] }]
    };
    const meta: ComponentMetaProvider = () => parentMeta;

    expect(getSlots(root, meta)).toBeTruthy();
  });
});

describe("HTML Components", () => {
  it("Element types use custom element interfaces", () => {
    const CustomElement: CustomElement = {
      tagName: ""
    };
    expect(typeof HTMLComponents.A).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.BR).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.CAPTION).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.COL).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.COLGROUP).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.DIV).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.H1).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.H2).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.H3).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.H4).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.H5).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.H6).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.IMG).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.P).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.SMALL).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.SPAN).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.STRONG).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.TABLE).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.TBODY).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.TD).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.TFOOT).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.TH).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.THEAD).toBe(typeof CustomElement);
    expect(typeof HTMLComponents.TR).toBe(typeof CustomElement);
  });
});
