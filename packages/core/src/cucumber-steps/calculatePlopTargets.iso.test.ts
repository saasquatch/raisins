import type { CustomElement } from "@raisins/schema/schema.js";
import { expect } from "expect";
import parse from "../html-dom/parser.ts";
import type { RaisinElementNode, RaisinNode } from "../html-dom/RaisinNode.ts";
import { getParents, visitAll } from "../html-dom/util.ts";
import { calculatePlopTargets } from "../validation/calculatePlopTargets.ts";
import { bindIsomorphicCucumberSteps } from "./bindIsomorphicCucumberSteps.ts";

const cucumber = (
  given: (...args: any[]) => void,
  when: (...args: any[]) => void,
  and: (...args: any[]) => void,
  then: (...args: any[]) => void,
) => {
  let parent: RaisinElementNode;
  let parents: WeakMap<RaisinNode, RaisinNode>;
  let plop: RaisinElementNode;
  let possiblePlopMeta: CustomElement;
  let parentMeta: CustomElement;

  given("a parent with following html", (html: string) => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- test fixture: first child is an element
    parent = parse(html, { cleanWhitespace: false })
      .children[0] as RaisinElementNode;
    parents = getParents(parent);
  });

  when("the parent is picked", () => {
    plop = parent;
  });
  then("there are no plop targets anywhere", () => {
    visitAll(parent, (n) => {
      const targets = calculatePlopTargets(
        n,
        plop,
        {
          parentMeta,
          possiblePlopMeta,
        },
        parents,
      );
      expect({ n, targets }).toStrictEqual({ n, targets: [] });
      return n;
    });
  });

  and("an outside plop target", () => {
    plop = {
      type: "tag",
      attribs: {},
      tagName: "plop",
      children: [],
    };
    possiblePlopMeta = {
      tagName: "plop",
    };
  });

  and(/^plop is child at position (\d) of parent$/, (number: number) => {
    plop = {
      type: "tag",
      attribs: {},
      tagName: "plop",
      children: [],
    };
    possiblePlopMeta = {
      tagName: "plop",
    };
    parent.children[number] = plop;
  });

  and(/^parent meta has slots (.*)$/, (json: string) => {
    parentMeta = {
      tagName: "parent",
      slots: [],
    };
    parentMeta.slots = JSON.parse(json);
  });

  and("a schema", () => {});

  then("calculatePlopTargets will return", (json: string) => {
    expect(
      calculatePlopTargets(
        parent,
        plop,
        {
          parentMeta,
          possiblePlopMeta,
        },
        parents,
      ),
    ).toStrictEqual(JSON.parse(json));
  });

  then(/^calculatePlopTargets will return (.*)$/, (json: string) => {
    expect(
      calculatePlopTargets(
        parent,
        plop,
        {
          parentMeta,
          possiblePlopMeta,
        },
        parents,
      ),
    ).toStrictEqual(JSON.parse(json));
  });
};

bindIsomorphicCucumberSteps(
  cucumber,
  "../validation/calculatePlopTargets.feature",
);
