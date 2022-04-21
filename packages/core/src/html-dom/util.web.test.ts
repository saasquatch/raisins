/* istanbul ignore file */

import { RaisinNode } from "./RaisinNode";
import { visit, visitAll } from "./util";

it("Visitor skip node", () => {
  const node: RaisinNode = {
    type: "root",
    children: [
      {
        type: "tag",
        tagName: "div",
        children: [
          {
            type: "text",
            data: "hello world"
          }
        ],
        attribs: {}
      }
    ]
  };
  const visitor = {
    skipNode: (_skipNode: any) => false
  };

  const spySkip = cy.spy(visitor, "skipNode");

  visit(node, visitor, true);
  visit(node, visitor, false);

  expect(spySkip).to.be.called;
});

it("Visit all", () => {
  const node: RaisinNode = {
    type: "root",
    children: [
      {
        type: "tag",
        tagName: "div",
        children: [
          {
            type: "text",
            data: "hello world"
          }
        ],
        attribs: {}
      }
    ]
  };

  const callback = {
    callbackCounter: (_callback: any) => false
  };

  const callbackSpy = cy.spy(callback, "callbackCounter");

  visitAll(node, (n: RaisinNode) => {
    callback.callbackCounter(0);
    return n;
  });

  expect(callbackSpy).to.be.called;
});
