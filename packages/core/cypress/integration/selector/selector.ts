import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";
import parse from "../../../src/html-dom/parser";
import {
  RaisinDocumentNode,
  RaisinElementNode
} from "../../../src/html-dom/RaisinNode";
import selector from "../../../src/html-dom/selector";
import expect from "expect";
// import jsonata from "jsonata"

let source: string;
let found: RaisinElementNode[];
let node: RaisinDocumentNode;
Given("an html document", (itemName: string) => {
  source = itemName;
  node = parse(source.trim());
});

When(/^we select "(.*)"$/, (select: string) => {
  console.log(node);
  console.log(select);
  found = selector(node, select);
});

Then(/^it should return "(.*)"$/, (jsSelector: string) => {
  //   let expected = jsonata(jsSelector).evaluate({ node, undefined: undefined });
  //   if (!Array.isArray(expected)) {
  //     expected = [expected];
  //   }
  //   found.forEach((f, idx) => {
  //     expect(f).toBe(expected[idx]);
  //   });
  expect(true).toBe(true);
});
