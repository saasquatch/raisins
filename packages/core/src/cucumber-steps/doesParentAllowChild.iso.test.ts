import { CustomElement } from "@raisins/schema/schema";
import expect from "expect";
import {
  RaisinCommentNode,
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinProcessingInstructionNode,
  RaisinStyleNode,
  RaisinTextNode
} from "../html-dom/RaisinNode";
import { doesParentAllowChild } from "../validation/rules/doesParentAllowChild";
import {
  bindIsomorphicCucumberSteps,
  IsoStepDefs
} from "./bindIsomorphicCucumberSteps";


const cucumber: IsoStepDefs = (
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
    data: "text-data"
  };
  const comment: RaisinCommentNode = {
    type: "comment",
    data: "comment-data"
  };
  const instruction: RaisinProcessingInstructionNode = {
    type: "directive",
    name: "directive-name",
    data: "directive-data"
  };
  const element: RaisinElementNode = {
    type: "tag",
    attribs: {},
    tagName: "my-example",
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

  then(
    /^parent allows node as child in the "(.*)" slot$/,
    (slotName: string) => {
      expect(doesParentAllowChild(node, parentMeta, slotName)).toBe(true);
    }
  );

  then(
    /^parent does not allow node as child in the "(.*)" slot$/,
    (slotName: string) => {
      expect(doesParentAllowChild(node, parentMeta, slotName)).toBe(false);
    }
  );
  then("parent allows node as child in the default slot", () => {
    expect(doesParentAllowChild(node, parentMeta, undefined)).toBe(true);
  });
  then("parent does not allow node as child in the default slot", () => {
    expect(doesParentAllowChild(node, parentMeta, undefined)).toBe(false);
  });
};

bindIsomorphicCucumberSteps(
  cucumber,
  "../validation/rules/doesParentAllowChild.feature"
);
