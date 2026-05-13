import expect from "expect";
import parser from "./parser";
import serializer from "./serializer";
import { scopeStylesheet } from "./scope";

function scoped(css: string, id = "abc"): string {
  return serializer(scopeStylesheet(parser(css), id));
}

describe("scopeStylesheet", () => {
  it("rewrites :host to the attribute selector", () => {
    expect(scoped(":host { color: red }")).toEqual(
      '[data-raisin-id="abc"]{color:red}'
    );
  });

  it("rewrites :host(<sel>) by fusing the inner selector", () => {
    expect(scoped(":host(.dark) { color: white }")).toEqual(
      '[data-raisin-id="abc"].dark{color:white}'
    );
  });

  it("rewrites :host(<sel>) with descendant combinators", () => {
    expect(scoped(":host(.dark) > div { color: white }")).toEqual(
      '[data-raisin-id="abc"].dark>div{color:white}'
    );
  });

  it("prefixes ::part(name) with the scope attribute selector", () => {
    expect(scoped("::part(button) { color: red }")).toEqual(
      '[data-raisin-id="abc"]::part(button){color:red}'
    );
  });

  it("preserves trailing pseudos on ::part", () => {
    expect(scoped("::part(button):hover { color: red }")).toEqual(
      '[data-raisin-id="abc"]::part(button):hover{color:red}'
    );
  });

  it("rewrites bare selectors as descendants of the scope", () => {
    expect(scoped(".foo { color: red }")).toEqual(
      '[data-raisin-id="abc"] .foo{color:red}'
    );
  });

  it("rewrites every selector in a selector list", () => {
    expect(scoped(":host, .foo, ::part(x) { color: red }")).toEqual(
      '[data-raisin-id="abc"],[data-raisin-id="abc"] .foo,[data-raisin-id="abc"]::part(x){color:red}'
    );
  });

  it("rewrites rules nested inside at-rules", () => {
    expect(
      scoped("@media (min-width: 100px) { :host { color: red } }")
    ).toEqual(
      '@media (min-width:100px){[data-raisin-id="abc"]{color:red}}'
    );
  });

  it("handles multiple rules in a stylesheet", () => {
    const css = ":host { color: red } .bar { color: blue }";
    expect(scoped(css)).toEqual(
      '[data-raisin-id="abc"]{color:red}[data-raisin-id="abc"] .bar{color:blue}'
    );
  });

  it("does not mutate the input AST", () => {
    const ast = parser(":host { color: red }");
    const before = JSON.stringify(ast);
    scopeStylesheet(ast, "abc");
    expect(JSON.stringify(ast)).toEqual(before);
  });
});
