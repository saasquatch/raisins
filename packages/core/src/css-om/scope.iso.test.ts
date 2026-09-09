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
    ).toEqual('@media (min-width:100px){[data-raisin-id="abc"]{color:red}}');
  });

  it("rewrites rules nested inside @supports", () => {
    expect(scoped("@supports (display:grid) { .a { color: red } }")).toEqual(
      '@supports (display:grid){[data-raisin-id="abc"] .a{color:red}}'
    );
  });

  it("leaves @keyframes selectors alone", () => {
    expect(
      scoped("@keyframes spin { from { opacity: 0 } to { opacity: 1 } }")
    ).toEqual("@keyframes spin{from{opacity:0}to{opacity:1}}");
  });

  it("leaves prefixed @keyframes selectors alone", () => {
    expect(
      scoped(
        "@-webkit-keyframes spin { 0% { opacity: 0 } 100% { opacity: 1 } }"
      )
    ).toEqual("@-webkit-keyframes spin{0%{opacity:0}100%{opacity:1}}");
  });

  it("scopes rules alongside an untouched @keyframes", () => {
    expect(
      scoped(
        "@keyframes spin { from { opacity: 0 } } :host { animation: spin 1s }"
      )
    ).toEqual(
      '@keyframes spin{from{opacity:0}}[data-raisin-id="abc"]{animation:spin 1s}'
    );
  });

  it("leaves @font-face alone", () => {
    expect(scoped("@font-face { font-family: x; src: url(y) }")).toEqual(
      "@font-face{font-family:x;src:url(y)}"
    );
  });

  it("handles multiple rules in a stylesheet", () => {
    const css = ":host { color: red } .bar { color: blue }";
    expect(scoped(css)).toEqual(
      '[data-raisin-id="abc"]{color:red}[data-raisin-id="abc"] .bar{color:blue}'
    );
  });

  it("expands nested & in ::part pseudoclasses", () => {
    expect(
      scoped("::part(primarybutton-base){&:hover{background-color: blue}}")
    ).toEqual(
      '[data-raisin-id="abc"]::part(primarybutton-base):hover{background-color:blue}'
    );
  });

  it("expands nested & with mixed declarations and nested rules", () => {
    expect(
      scoped("::part(button){color:red;&:hover{background:blue}}")
    ).toEqual(
      '[data-raisin-id="abc"]::part(button){color:red}[data-raisin-id="abc"]::part(button):hover{background:blue}'
    );
  });

  it("expands multiple nested rules", () => {
    expect(
      scoped("::part(btn){&:hover{background:blue}&:focus{outline:none}}")
    ).toEqual(
      '[data-raisin-id="abc"]::part(btn):hover{background:blue}[data-raisin-id="abc"]::part(btn):focus{outline:none}'
    );
  });

  it("expands nested & in :host rules", () => {
    expect(scoped(":host{&:hover{color:red}}")).toEqual(
      '[data-raisin-id="abc"]:hover{color:red}'
    );
  });

  it("expands nested & inside an at-rule", () => {
    expect(
      scoped("@media (min-width:1px){ ::part(x){ &:hover{color:red} } }")
    ).toEqual(
      '@media (min-width:1px){[data-raisin-id="abc"]::part(x):hover{color:red}}'
    );
  });

  it("does not mutate the input AST", () => {
    const ast = parser(":host { color: red }");
    const before = JSON.stringify(ast);
    scopeStylesheet(ast, "abc");
    expect(JSON.stringify(ast)).toEqual(before);
  });
});
