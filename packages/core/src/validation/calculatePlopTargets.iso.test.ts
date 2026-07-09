import { CustomElement } from "@raisins/schema/schema";
import expect from "expect";
import parse from "../html-dom/parser";
import { RaisinElementNode } from "../html-dom/RaisinNode";
import { getParents } from "../html-dom/util";
import { calculatePlopTargets } from "./calculatePlopTargets";

/**
 * Regression tests for the "global top-level drop target" bug: a component
 * restricted to specific parents (e.g. stats) must not receive a root drop
 * target, even when root begins with a whitespace text node.
 */

const restrictedPlop: RaisinElementNode = {
  type: "tag",
  tagName: "sqm-stat",
  attribs: {},
  children: [],
};
const restrictedMeta: CustomElement = {
  tagName: "sqm-stat",
  validParents: ["sqm-stat-container"],
};

const unrestrictedPlop: RaisinElementNode = {
  type: "tag",
  tagName: "sqm-text",
  attribs: {},
  children: [],
};
const unrestrictedMeta: CustomElement = { tagName: "sqm-text" };

const rootMeta: CustomElement = {
  tagName: "",
  slots: [{ name: "", title: "Content" }],
};

function rootFor(html: string) {
  const root = parse(html, { cleanWhitespace: false });
  return { root, parents: getParents(root) };
}

describe("calculatePlopTargets — root parent validation", () => {
  it("denies a parent-restricted component at an empty root", () => {
    const { root, parents } = rootFor("");
    const targets = calculatePlopTargets(
      root,
      restrictedPlop,
      { parentMeta: rootMeta, possiblePlopMeta: restrictedMeta },
      parents
    );
    expect(targets).toEqual([]);
  });

  it("denies a parent-restricted component when root starts with a whitespace text node", () => {
    // The exact shape that produced the accept-anything global target.
    const { root, parents } = rootFor("\n  <sqm-text></sqm-text>");
    const targets = calculatePlopTargets(
      root,
      restrictedPlop,
      { parentMeta: rootMeta, possiblePlopMeta: restrictedMeta },
      parents
    );
    expect(targets).toEqual([]);
  });

  it("still allows an unrestricted component at an effectively-empty root", () => {
    const { root, parents } = rootFor("\n   \n");
    const targets = calculatePlopTargets(
      root,
      unrestrictedPlop,
      { parentMeta: rootMeta, possiblePlopMeta: unrestrictedMeta },
      parents
    );
    expect(targets).toEqual([{ idx: 0, slot: "" }]);
  });

  it("offers per-child targets (not a single global one) when root has element children", () => {
    const { root, parents } = rootFor(
      "\n<sqm-text></sqm-text><sqm-text></sqm-text>"
    );
    const targets = calculatePlopTargets(
      root,
      unrestrictedPlop,
      { parentMeta: rootMeta, possiblePlopMeta: unrestrictedMeta },
      parents
    );
    // General per-child logic runs instead of the empty-root short-circuit,
    // so there is more than one candidate position.
    expect(targets.length).toBeGreaterThan(1);
  });
});
