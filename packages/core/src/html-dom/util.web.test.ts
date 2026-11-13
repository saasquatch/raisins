/* istanbul ignore file */

import { vi } from "vitest";
import type { RaisinNode } from "./RaisinNode.ts";
import { visit, visitAll } from "./util.ts";

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
            data: "hello world",
          },
        ],
        attribs: {},
      },
    ],
  };
  const visitor = {
    skipNode: (_skipNode: any) => false,
  };

  const spySkip = vi.spyOn(visitor, "skipNode");

  visit(node, visitor, true);
  visit(node, visitor, false);

  expect(spySkip).toHaveBeenCalled();
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
            data: "hello world",
          },
        ],
        attribs: {},
      },
    ],
  };

  const callback = {
    callbackCounter: (_callback: any) => false,
  };

  const callbackSpy = vi.spyOn(callback, "callbackCounter");

  visitAll(node, (n: RaisinNode) => {
    callback.callbackCounter(0);
    return n;
  });

  expect(callbackSpy).toHaveBeenCalled();
});
