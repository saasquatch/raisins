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
import { doesChildAllowParent } from "../validation/rules/doesChildAllowParent";

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
  var childMeta: CustomElement;

  given("a child meta", (meta: string) => {
    childMeta = JSON.parse(meta);
  });

  and(/^validParents includes (.*)$/, (tagName: string) => {
    childMeta.validParents = [tagName];
  });

  and(/^an? (.*) node$/, (nodeType: nodeType) => {
    node = nodes[nodeType];
  });

  and(/^node has tag (.*)$/, (tagName: string) => {
    node.tagName = tagName;
  });

  then("child allows node as parent", () => {
    expect(doesChildAllowParent(childMeta, node)).toBe(true);
  });

  then("child does not allow node as parent", () => {
    expect(doesChildAllowParent(childMeta, node)).toBe(false);
  });
};

var jestSteps: StepDefinitions = () => {};

if (!JEST) {
  cucumber(given, and, then);
} else {
  const jest_cucumber = require("jest-cucumber");

  const feature = jest_cucumber.loadFeature(
    "../validation/rules/doesChildAllowParent.feature",
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
