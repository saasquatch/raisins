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
import { validateChildConstraints } from "../validation/validateNode/validateNode";

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
  var metalist: any;

  given(/^a (.*) node$/, (type: nodeType) => {
    node = nodes[type];
  });

  given("a parent node of type element", () => {
    node = { type: "tag", attribs: {}, tagName: "parent", children: [] };
  });

  and("it has a child of type element", () => {
    node.children = [
      {
        type: "tag",
        attribs: { slot: "children" },
        tagName: "child",
        children: []
      }
    ];
  });

  and("a meta list", () => {
    metalist = [];
  });

  and("it includes a parent meta that allows child", () => {
    metalist.push({
      tagName: "parent",
      slots: [{ name: "children", validChildren: ["child"] }]
    });
  });

  and("it includes a parent meta that does not allow child", () => {
    metalist.push({ tagName: "parent", slots: [{ name: "no-child" }] });
  });

  and("it includes a child meta that allows parent", () => {
    metalist.push({ tagName: "child", validParents: ["parent"] });
  });

  and("it includes a child meta that does not allow parent", () => {
    metalist.push({ tagName: "child", validParents: ["no-parent"] });
  });

  then("no error is returned", () => {
    expect(validateChildConstraints(node, metalist)).toStrictEqual([]);
  });

  then("doesParentAllowChild error is returned", () => {
    expect(validateChildConstraints(node, metalist)).toStrictEqual([
      {
        error: {
          rule: "doesParentAllowChild"
        },
        jsonPointer: "/children/0"
      }
    ]);
  });

  then("doesChildAllowParent error is returned", () => {
    expect(validateChildConstraints(node, metalist)).toStrictEqual([
      {
        error: {
          rule: "doesChildAllowParent"
        },
        jsonPointer: "/children/0"
      }
    ]);
  });
};

var jestSteps: StepDefinitions = () => {};

if (!JEST) {
  cucumber(given, and, then);
} else {
  const jest_cucumber = require("jest-cucumber");

  const feature = jest_cucumber.loadFeature(
    "../validation/validateNode/validateNode.feature",
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
