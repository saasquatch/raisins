import jsonata from "jsonata";
import { bindIsomorphicCucumberSteps } from "../cucumber-steps/bindIsomorphicCucumberSteps.ts";
import parse from "./parser.ts";
import type { RaisinDocumentNode, RaisinElementNode } from "./RaisinNode.ts";
import featureText from "./selector.feature?raw";
import selector, { matches } from "./selector.ts";

const cucumber = (
  given: (...args: any[]) => void,
  when: (...args: any[]) => void,
  then: (...args: any[]) => void,
) => {
  let node: RaisinDocumentNode;
  let found: RaisinElementNode[];

  given("an html document", (source: string) => {
    node = parse(source.trim());
  });

  when(/^we select "(.*)"$/, (select: string) => {
    found = selector(node, select);
  });

  then(/^it should match "(.*)"$/, (query: string) => {
    expect(found).toHaveLength(1);
    expect(matches(node, found[0], query)).toBe(true);
  });

  then(/^it should not match "(.*)"$/, (query: string) => {
    expect(found).toHaveLength(1);
    expect(matches(node, found[0], query)).toBe(false);
  });

  then(/^it should return "(.*)"$/, (expression: string) => {
    const result = jsonata(expression).evaluate({ node, undefined });
    const expected =
      result === undefined ? [] : Array.isArray(result) ? result : [result];

    expect(found).toEqual(expected);
  });
};

bindIsomorphicCucumberSteps(cucumber, featureText);
