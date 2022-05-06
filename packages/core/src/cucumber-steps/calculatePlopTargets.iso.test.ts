import { CustomElement } from "@raisins/schema/schema";
import expect from "expect";
import parse from "../html-dom/parser";
import { RaisinElementNode } from "../html-dom/RaisinNode";
import { calculatePlopTargets } from "../validation/calculatePlopTargets";
import { bindIsomorphicCucumberSteps } from "./bindIsomorphicCucumberSteps";

const cucumber = (
  given: (...args: any[]) => void,
  and: (...args: any[]) => void,
  then: (...args: any[]) => void
) => {
  var parent: RaisinElementNode;
  var plop: RaisinElementNode;
  var possiblePlopMeta: CustomElement;
  var parentMeta: CustomElement;
  var schema: { parentMeta: CustomElement; possiblePlopMeta: CustomElement };

  given("a parent with following html", (html: string) => {
    parent = parse(html, { cleanWhitespace: true })
      .children[0] as RaisinElementNode;
  });

  and("an outside plop target", () => {
    plop = {
      type: "tag",
      attribs: {},
      tagName: "plop",
      children: []
    };
    possiblePlopMeta = {
      tagName: "plop"
    };
  });

  and(/^plop is child at position (\d) of parent$/, (number: number) => {
    plop = {
      type: "tag",
      attribs: {},
      tagName: "plop",
      children: []
    };
    possiblePlopMeta = {
      tagName: "plop"
    };
    parent.children[number] = plop;
  });

  and(/^parent meta has slots (.*)$/, (json: string) => {
    parentMeta = {
      tagName: "parent",
      slots: []
    };
    parentMeta.slots = JSON.parse(json);
  });

  and("a schema", () => {
    schema = {
      parentMeta,
      possiblePlopMeta
    };
  });

  then("calculatePlopTargets will return", (json: string) => {
    expect(calculatePlopTargets(parent, plop, schema)).toStrictEqual(
      JSON.parse(json)
    );
  });

  then(/^calculatePlopTargets will return (.*)$/, (json: string) => {
    expect(calculatePlopTargets(parent, plop, schema)).toStrictEqual(
      JSON.parse(json)
    );
  });
};

bindIsomorphicCucumberSteps(
  cucumber,
  "../validation/rules/calculatePlopTargets.feature"
);
