import {
  And as and,
  Given as given,
  When as when,
  Then as then
} from "cypress-cucumber-preprocessor/steps";
import expect from "expect";
import { StepDefinitions } from "jest-cucumber";
import parse from "../html-dom/parser";
import {
  RaisinCommentNode,
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinProcessingInstructionNode,
  RaisinStyleNode,
  RaisinTextNode
} from "../html-dom/RaisinNode";
import {
  isValidColor,
  isValidDateInterval,
  isValidURL,
  validateAttributes,
  validateChildConstraints
} from "../validation/validateNode/validateNode";

const JEST = process.env.JEST_WORKER_ID !== undefined;

const cucumber = (
  given: (...args: any[]) => void,
  and: (...args: any[]) => void,
  when: (...args: any[]) => void,
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
    const errors = validateChildConstraints(node, metalist);
    expect(errors.length).toBe(1);
    expect(errors[0].error.rule).toBe("doesParentAllowChild");
    expect(errors[0].jsonPointer).toBe("/children/0");
  });

  then("doesChildAllowParent error is returned", () => {
    const errors = validateChildConstraints(node, metalist);
    expect(errors.length).toBe(1);
    expect(errors[0].error.rule).toBe("doesChildAllowParent");
    expect(errors[0].jsonPointer).toBe("/children/0");
  });

  var input: string;
  var result: boolean;

  given(/^an input value of (.*)$/, (value: string) => {
    input = value;
  });

  when("isValidColor is tested", () => {
    result = isValidColor(input);
  });

  when("isValidDateInterval is tested", () => {
    result = isValidDateInterval(input);
  });

  when("isValidURL is tested", () => {
    result = isValidURL(input);
  });

  then("it returns true", () => {
    expect(result).toBe(true);
  });

  then("it returns false", () => {
    expect(result).toBe(false);
  });

  and("it has attribute", () => {
    metalist = [
      {
        tagName: "div",
        attributes: [{ name: "" }]
      }
    ];
  });

  and(/^enum is (.*)$/, (value: string) => {
    metalist[0].attributes[0].enum = JSON.parse(value);
  });

  and(/^required is (\w*)$/, (value: string) => {
    if (value === "true") metalist[0].attributes[0].required = true;
    else metalist[0].attributes[0].required = false;
  });

  and(
    /^(?:(?!required|no error|error|doesChildAllowParent|enum|no validation error|isValidURL|isValidDateInterval|isValidColor))(.*) is (.*)$/,
    (prop: string, value: string) => {
      metalist[0].attributes[0][prop] = value;
    }
  );

  and(/^a parsed (.*)$/, (html: string) => {
    node = parse(html).children[0];
  });

  then(/^(.*) validation error is received$/, (rule: string) => {
    if (rule === "no")
      expect(validateAttributes(node, metalist)).toStrictEqual([]);
    else
      expect(validateAttributes(node, metalist)[0]?.error?.rule).toStrictEqual(
        rule
      );
  });
};

var jestSteps: StepDefinitions = () => {};

if (!JEST) {
  cucumber(given, and, when, then);
} else {
  const jest_cucumber = require("jest-cucumber");

  const feature = jest_cucumber.loadFeature(
    "../validation/validateNode/validateNode.feature",
    {
      loadRelativePath: true
    }
  );

  var jestSteps: StepDefinitions = ({ given, and, when, then }) => {
    cucumber(given, and, when, then);
  };

  jest_cucumber.autoBindSteps([feature], [jestSteps]);
}

export const steps = jestSteps;
