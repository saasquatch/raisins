import { autoBindSteps, loadFeature, StepDefinitions } from "jest-cucumber";
import jsonata from "jsonata";
import { parse } from "./parser";
import { RaisinDocumentNode, RaisinElementNode } from "./RaisinNode";
import selector from "./selector";

const feature = loadFeature("./selector.feature", { loadRelativePath: true });

export const selectorSteps: StepDefinitions = ({ given, when, then }) => {
  let source: string;
  let found: RaisinElementNode[];
  let node: RaisinDocumentNode;
  given("an html document", (itemName: string) => {
    source = itemName;
    node = parse(source);
  });

  when(/^we select "(.*)"$/, (select: string) => {
    found = selector(node, select);
  });

  then(/^it should return "(.*)"$/, (jsSelector: string) => {
    expect(found[0]).toBe(
      jsonata(jsSelector).evaluate({ node, undefined: undefined })
    );
  });
};

autoBindSteps([feature], [selectorSteps]);

// describe("Parse + select", () => {
//   test("Can parse simple HTML", () => {
//     const source = `<div>Example</div>`;
//     const select = "div";
//     const jsSelector = "node.children[0]";
//     const node = parse(source);
//     const found = selector(node, select);
//     expect(found[0]).toBe(jsonata(jsSelector).evaluate({ node }));
//   });

//   test("Nested div", () => {
//     const source = `<div>Outer<div>Inner</div></div>`;
//     const select = "div div";
//     const jsSelector = "node.children[0].children[1]";
//     const node = parse(source);
//     const found = selector(node, select);
//     expect(found[0]).toBe(jsonata(jsSelector).evaluate({ node }));
//   });
// });
