import { CustomElement } from "@raisins/schema/schema";
import {
  And as and,
  Given as given,
  Then as then
} from "cypress-cucumber-preprocessor/steps";
import expect from "expect";
import { StepDefinitions } from "jest-cucumber";
import {
  RaisinCommentNode,
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinProcessingInstructionNode,
  RaisinStyleNode,
  RaisinTextNode
} from "../html-dom/RaisinNode";
import { doesParentAllowChild } from "../validation/rules/doesParentAllowChild";

const JEST = process.env.JEST_WORKER_ID !== undefined;

const cucumber = (
  given: (...args: any[]) => void,
  and: (...args: any[]) => void,
  then: (...args: any[]) => void
) => {
  const root: RaisinDocumentNode = {
    type: "root",
    children: []
  };
  const style: RaisinStyleNode = {
    type: "style",
    attribs: {},
    tagName: "style"
  };
  const text: RaisinTextNode = {
    type: "text",
    data: ""
  };
  const comment: RaisinCommentNode = {
    type: "comment",
    data: ""
  };
  const instruction: RaisinProcessingInstructionNode = {
    type: "directive",
    name: "",
    data: ""
  };
  const element: RaisinElementNode = {
    type: "tag",
    attribs: {},
    tagName: "",
    children: []
  };

  const nodes = {
    root,
    style,
    text,
    comment,
    element,
    instruction
  };

  type nodeType =
    | "root"
    | "style"
    | "text"
    | "element"
    | "comment"
    | "instruction";

  var node: any;
  var parentMeta: CustomElement;

  given("a parent meta", (meta: string) => {
    parentMeta = JSON.parse(meta);
  });
  and(/^a node of (.*)$/, (nodeType: nodeType) => {
    node = nodes[nodeType];
  });

  and("an element node", () => {});

  and(/^node has (.*)$/, (tagName: string) => {
    node.tagName = tagName;
  });

  and(/^validChildren has (.*)$/, (tagName: string) => {
    //@ts-ignore
    parentMeta.slots[0].validChildren = [tagName];
  });

  then("parent allows node as child", () => {
    expect(doesParentAllowChild(node, parentMeta, "child")).toBe(true);
  });

  then("parent does not allow node as child", () => {
    expect(doesParentAllowChild(node, parentMeta, "child")).toBe(false);
  });
};

var jestSteps: StepDefinitions = () => {};

if (!JEST) {
  cucumber(given, and, then);
} else {
  const jest_cucumber = require("jest-cucumber");

  const feature = jest_cucumber.loadFeature(
    "../validation/rules/doesParentAllowChild.feature",
    {
      loadRelativePath: true
    }
  );

  var jestSteps: StepDefinitions = ({ given, and, then }) => {
    cucumber(given, and, then);
  };

  jest_cucumber.autoBindSteps([feature], [jestSteps]);
}

export const steps = jestSteps;
