import {
  isRoot,
  isNodeWithChilden,
  isTextNode,
  isStyleNode,
  isElementNode,
  isCommentNode
} from "./isNode";
import parse from "./parser";

describe("isNode utility", () => {
  function isNode(src: string, ...fns: any[]) {
    test(src + "should be node", () => {
      const doc = parse(src);
      expect(doc.children.length).toBe(1);
      const child = doc.children[0];
      fns.forEach(fn => {
        expect(fn(child)).toBe(true);
      });
    });
  }

  test("Root should be root", () => {
    const doc = parse("");
    expect(isRoot(doc)).toBe(true);
  });

  test("False if no node is provided", () => {
    expect(isRoot()).toBe(false);
  });

  isNode(`<div></div>`, isElementNode, isNodeWithChilden);
  isNode(`<!--This is a comment -->`, isCommentNode);
  isNode(`<style></style>`, isStyleNode);
  isNode(`hello world`, isTextNode);
  // UNSUPPORTED
  // isNode(`<!DOCTYPE html>`, isDirectiveNode);
});
