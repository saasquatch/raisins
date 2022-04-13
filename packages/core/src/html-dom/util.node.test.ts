import { RaisinNode } from "./RaisinNode";
import { visit, visitAll } from "./util";
import expect from "expect";

test("Visitor skip node", () => {
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

  const spySkip = jest.spyOn(visitor, "skipNode");

  visit(node, visitor, true);
  visit(node, visitor, false);

  expect(spySkip).toBeCalledTimes(2);
});

test("Visit all", () => {
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

  const callbackSpy = jest.spyOn(callback, "callbackCounter");

  visitAll(node, (n: RaisinNode) => {
    callback.callbackCounter(0);
    return n;
  });

  expect(callbackSpy).toBeCalledTimes(3);
});
