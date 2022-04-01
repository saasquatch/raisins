import { autoBindSteps, loadFeature, StepDefinitions } from "jest-cucumber";
import jsonata from "jsonata";
import { parse } from "./parser";
import { RaisinDocumentNode, RaisinElementNode } from "./RaisinNode";
import selector from "./selector";

const feature = loadFeature("cypress/integration/Specs/selector.feature");

export const selectorSteps: StepDefinitions = ({ given, when, then }) => {
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

  then(/^it should return "(.*)"$/, (jsSelector: string) => {
    let expected = jsonata(jsSelector).evaluate({ node, undefined: undefined });
    if (!Array.isArray(expected)) {
      expected = [expected];
    }
    found.forEach((f, idx) => {
      expect(f).toBe(expected[idx]);
    });
  });
};

autoBindSteps([feature], [selectorSteps]);
