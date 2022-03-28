import parse from "../../src/html-dom/parser";
import serializer from "../../src/html-dom/serializer";
import isHtmlEquivalent from "../../src/html-dom/testing/isHtmlEquivalent";
import expect from "expect";

describe("Parse + serialize", () => {
  it("Can parse Email Benchmark cases", () => {
    cy.task("getFiles", "benchmark-emails").each(file => {
      cy.readFile("./benchmark-emails/" + file).then(source => {
        const raisinNode = parse(source, {
          cleanWhitespace: false
        });
        const raisinString = serializer(raisinNode);
        expect(isHtmlEquivalent(source, raisinString)).toBe(true);
      });
    });
  });
});
