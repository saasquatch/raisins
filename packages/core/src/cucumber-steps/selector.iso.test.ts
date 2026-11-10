import jsonata from "jsonata";
import parse from "../html-dom/parser.ts";
import type {
  RaisinDocumentNode,
  RaisinElementNode,
} from "../html-dom/RaisinNode.ts";
import feature from "../html-dom/selector.feature?raw";
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
    expect(found.length).toBe(1);
    const doesMatch = matches(node, found[0], query);
    expect(doesMatch).toBeTruthy();
  });

  then(/^it should not match "(.*)"$/, (query: string) => {
    expect(found.length).toBe(1);
    const doesMatch = matches(node, found[0], query);
    expect(doesMatch).toBeFalsy();
  });

  then(/^it should return "(.*)"$/, (jsSelector: string) => {
    let expected = jsonata(jsSelector).evaluate({
      node,
      undefined: undefined,
    });
    if (!Array.isArray(expected)) {
      expected = [expected];
    }
    found.forEach((f, idx) => {
      expect(f).toBe(expected[idx]);
    });
  });
};

bindIsomorphicCucumberSteps(cucumber, feature);
