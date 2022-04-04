import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";
import parse from "../../../src/html-dom/parser";
import {
  RaisinDocumentNode,
  RaisinElementNode
} from "../../../src/html-dom/RaisinNode";
import selector from "../../../src/html-dom/selector";
import expect from "expect";

let source: string;
let found: RaisinElementNode[];
let node: RaisinDocumentNode;
Given("an html document", (itemName: string) => {
  source = itemName;
  node = parse(source.trim());
});

When(/^we select "(.*)"$/, (select: string) => {
  found = selector(node, select);
});

Then(/^it should return "(.*)"$/, (jsSelector: string) => {
  cy.task("getJsonata", { jsSelector, node, found }).then((result: any) => {
    for (let i = 0; i < result.f_array.length; i++) {
      expect(result.f_array[i]).toStrictEqual(result.expected_array[i]);
    }
  });
});
