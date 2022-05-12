import { CustomElement } from "@raisins/schema/schema";
import expect from "expect";
import parse from "../html-dom/parser";
import { RaisinElementNode, RaisinNode } from "../html-dom/RaisinNode";
import { getParents, visitAll } from "../html-dom/util";
import { calculatePlopTargets } from "../validation/calculatePlopTargets";
import { bindIsomorphicCucumberSteps } from "./bindIsomorphicCucumberSteps";

const cucumber = (
  given: (...args: any[]) => void,
  when: (...args: any[]) => void,
  and: (...args: any[]) => void,
  then: (...args: any[]) => void
) => {
  let parent: RaisinElementNode;
  let parents: WeakMap<RaisinNode, RaisinNode>;
  let plop: RaisinElementNode;
  let possiblePlopMeta: CustomElement;
  let parentMeta: CustomElement;

  given("a parent with following html", (html: string) => {
    parent = parse(html, { cleanWhitespace: true })
      .children[0] as RaisinElementNode;
    parents = getParents(parent);
  });

  when("the parent is picked", () => {
    plop = parent;
  });
  then("there are no plop targets anywhere", () => {
    visitAll(parent, n => {
      const targets = calculatePlopTargets(
        n,
        plop,
        {
          parentMeta,
          possiblePlopMeta
        },
        parents
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
      children: []
    };
    possiblePlopMeta = {
      tagName: "plop"
    };
  });

  and(/^plop is child at position (\d) of parent$/, (number: number) => {
    plop = {
      type: "tag",
      attribs: {},
      tagName: "plop",
      children: []
    };
    possiblePlopMeta = {
      tagName: "plop"
    };
    parent.children[number] = plop;
  });

  and(/^parent meta has slots (.*)$/, (json: string) => {
    parentMeta = {
      tagName: "parent",
      slots: []
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
          possiblePlopMeta
        },
        parents
      )
    ).toStrictEqual(JSON.parse(json));
  });

  then(/^calculatePlopTargets will return (.*)$/, (json: string) => {
    expect(
      calculatePlopTargets(
        parent,
        plop,
        {
          parentMeta,
          possiblePlopMeta
        },
        parents
      )
    ).toStrictEqual(JSON.parse(json));
  });
};

bindIsomorphicCucumberSteps(
  cucumber,
  "../validation/calculatePlopTargets.feature"
);
