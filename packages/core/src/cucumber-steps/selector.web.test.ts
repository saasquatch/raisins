import jsonata from "jsonata";
/* istanbul ignore file */
import parse from "../html-dom/parser.ts";
import type {
  RaisinDocumentNode,
  RaisinElementNode,
} from "../html-dom/RaisinNode.ts";
import featureText from "../html-dom/selector.feature?raw";
import selector, { matches } from "../html-dom/selector.ts";
import { bindIsomorphicCucumberSteps } from "./bindIsomorphicCucumberSteps.ts";

const cucumber = (
  given: (...args: any[]) => void,
  when: (...args: any[]) => void,
  then: (...args: any[]) => void,
) => {
  let source: string;
  let found: RaisinElementNode[];
  let node: RaisinDocumentNode;
  given("an html document", (itemName: string) => {
    source = itemName;
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

  then(/^it should return "(.*)"$/, (jsSelector: string) => {
    const result = jsonata(jsSelector).evaluate({ node, undefined });
    const expected =
      result === undefined ? [] : Array.isArray(result) ? result : [result];

    expect(found).toEqual(expected);
  });
};

bindIsomorphicCucumberSteps(cucumber, featureText);
