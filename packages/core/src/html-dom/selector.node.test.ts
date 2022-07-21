import {
  Given as given,
  Then as then,
  When as when
} from "cypress-cucumber-preprocessor/steps";
import expect from "expect";
import { StepDefinitions } from "jest-cucumber";
import parse from "../html-dom/parser";
import { RaisinDocumentNode, RaisinElementNode } from "../html-dom/RaisinNode";
import selector, { matches } from "../html-dom/selector";

const JEST = process.env.JEST_WORKER_ID !== undefined;

const cucumber = (
  given: (...args: any[]) => void,
  when: (...args: any[]) => void,
  then: (...args: any[]) => void
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
    if (!JEST) {
      cy.task("getJsonata", { jsSelector, node, found }).then((result: any) => {
        for (let i = 0; i < result.f_array.length; i++) {
          expect(result.f_array[i]).toStrictEqual(result.expected_array[i]);
        }
      });
    } else {
      let jsonata = require("jsonata");
      let expected = jsonata(jsSelector).evaluate({
        node,
        undefined: undefined
      });
      if (!Array.isArray(expected)) {
        expected = [expected];
      }
      found.forEach((f, idx) => {
        expect(f).toBe(expected[idx]);
      });
    }
  });
};

var selectorSteps: StepDefinitions = () => {};

if (!JEST) {
  cucumber(given, when, then);
} else {
  const jest_cucumber = require("jest-cucumber");

  const feature = jest_cucumber.loadFeature("../html-dom/selector.feature", {
    loadRelativePath: true
  });

  var selectorSteps: StepDefinitions = ({ given, when, then }) => {
    cucumber(given, when, then);
  };

  jest_cucumber.autoBindSteps([feature], [selectorSteps]);
}

export const steps = selectorSteps;
