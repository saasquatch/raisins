/* istanbul ignore file */
import { expect } from "expect";
import parse from "../html-dom/parser.ts";
import type {
  RaisinDocumentNode,
  RaisinElementNode,
} from "../html-dom/RaisinNode.ts";
import selector from "../html-dom/selector.ts";
import isJest from "../testing/isJest.ts";
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

  then(/^it should return "(.*)"$/, (jsSelector: string) => {
    if (!isJest()) {
      cy.task("getJsonata", { jsSelector, node, found }).then((result: any) => {
        for (let i = 0; i < result.f_array.length; i++) {
          expect(result.f_array[i]).toStrictEqual(result.expected_array[i]);
        }
      });
    } else {
      //   let jsonata = require("jsonata");
      //   let expected = jsonata(jsSelector).evaluate({
      //     node,
      //     undefined: undefined
      //   });
      //   if (!Array.isArray(expected)) {
      //     expected = [expected];
      //   }
      //   found.forEach((f, idx) => {
      //     expect(f).toBe(expected[idx]);
      //   });
    }
  });
};

bindIsomorphicCucumberSteps(cucumber, "../html-dom/selector.feature");
