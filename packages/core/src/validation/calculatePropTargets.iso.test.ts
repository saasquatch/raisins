import parse from "../html-dom/parser";
import { CustomElement } from "@raisins/schema/schema";
import { calculatePlopTargets } from "./calculatePlopTargets";
import { RaisinElementNode } from "../html-dom/RaisinNode";
import expect from "expect";
import _ from "lodash";

describe("", () => {
  it("Calculate Plop Targets - Single slot", () => {
    const node: RaisinElementNode = {
      type: "tag",
      attribs: { slot: "children" },
      tagName: "sqm-timeline-stuff",
      children: []
    };

    const plop: RaisinElementNode = {
      type: "tag",
      attribs: { slot: "children" },
      tagName: "sqm-timeline-entry",
      children: []
    };
    const plopMeta: CustomElement = {
      tagName: "sqm-timeline-entry",
      slots: [{ name: "chisldren" }]
    };

    const parentEmpty: RaisinElementNode = {
      type: "tag",
      attribs: {},
      tagName: "sqm-timeline",
      children: []
    };

    const parent1Node: RaisinElementNode = {
      type: "tag",
      attribs: {},
      tagName: "sqm-timeline",
      children: [node]
    };

    const parent2Node: RaisinElementNode = {
      type: "tag",
      attribs: {},
      tagName: "sqm-timeline",
      children: [
        {
          type: "tag",
          attribs: { slot: "children" },
          tagName: "sqm-timeline-stuff",
          children: []
        },
        plop
      ]
    };

    console.log(parent2Node.children[1] === plop);

    const parent3Node: RaisinElementNode = {
      type: "tag",
      attribs: {},
      tagName: "sqm-timeline",
      children: [node, node, node]
    };

    const parentMeta: CustomElement = {
      tagName: "sqm-timeline",
      slots: [{ name: "children" }]
    };
    const schema = {
      parentMeta,
      possiblePlopMeta: plopMeta
    };

    //   expect(calculatePlopTargets(parentEmpty, plop, schema).length).toBe(1);
    //   expect(calculatePlopTargets(parent1Node, plop, schema).length).toBe(2);
    //   expect(calculatePlopTargets(parent2Node, plop, schema).length).toBe(3);
    //   expect(calculatePlopTargets(parent3Node, plop, schema).length).toBe(4);

    //   const res = calculatePlopTargets(parent3Node, plop, schema);
    //   console.log(res);
  });

  it("Calculate Plop Targets - Double slot", () => {
    const possiblePlopMeta: CustomElement = {
      tagName: "sqm-timeline-entry",
      slots: [{ name: "a" },  { name: "b" }]
    };

    const plop: RaisinElementNode = {
      type: "tag",
      tagName: "sqm-timeline-entry",
      attribs: { slot: "a" },
      children: []
    };

    const node = (type: string): RaisinElementNode => {
      return {
        type: "tag",
        tagName: "sqm-timeline-entry",
        attribs: { slot: type },
        children: []
      };
    };

    const parentMeta: CustomElement = {
      tagName: "sqm-timeline",
      slots: [{ name: "a" }, { name: "b" }]
    };

    const parent1A: RaisinElementNode = {
      type: "tag",
      tagName: "sqm-timeline",
      attribs: {},
      children: [node("b"), node("a"), node("b"), node("a")]
    };
    // var res = calculatePlopTargets(parent1A, plop, schema);
    // console.log("\n\n", res);

    const parentPA: RaisinElementNode = {
      type: "tag",
      tagName: "sqm-timeline",
      attribs: {},
      children: [node("a"),node("b"), node("a")]
    };

    const schema = {
      parentMeta,
      possiblePlopMeta
    };

    var res = calculatePlopTargets(parentPA, plop, schema);
    console.log("\n\n", res);
  });
});
