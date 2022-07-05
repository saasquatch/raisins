import expect from "expect";
import {
  isCommentNode,
  isDirectiveNode,
  isElementNode,
  isNodeWithChildren,
  isRoot,
  isStyleNode,
  isTextNode
} from "./isNode";
import parse from "./parser";

describe("isNode utility", () => {
  function isNode(src: string, ...fns: any[]) {
    it(src + " should be node", () => {
      const doc = parse(src);
      expect(doc.children.length).toBe(1);
      const child = doc.children[0];
      fns.forEach(fn => {
        expect(fn(child)).toBe(true);
      });
    });
  }

  it("Root should be root", () => {
    const doc = parse("");
    expect(isRoot(doc)).toBe(true);
  });

  it("False if no node is provided", () => {
    expect(isRoot()).toBe(false);
  });

  isNode(`<div></div>`, isElementNode, isNodeWithChildren);
  isNode(`<!--This is a comment -->`, isCommentNode);
  isNode(`<style></style>`, isStyleNode);
  isNode(`hello world`, isTextNode);
  isNode(`<!DOCTYPE html>`, isDirectiveNode);
});
