import { CssNodePlain } from "css-tree";
import { StateUpdater } from "../../../src/util/NewState";
import { StyleNodeWithChildren } from "../../../src/css-om/Types";
import { createChildUpdater, createUpdater } from "../../../src/css-om/util";
import expect from "expect";

describe("createChildUpdater", () => {
  it("With function", () => {
    const node: any = {
      type: "Brackets",
      children: [{ type: "Comment", value: "hello world" }]
    };

    let updatedNode: any;

    const updater: StateUpdater<StyleNodeWithChildren> = ((
      reducer: (current: StyleNodeWithChildren) => StyleNodeWithChildren
    ) => {
      updatedNode = reducer(node);
    }) as StateUpdater<StyleNodeWithChildren>;

    const stateUpdater = createChildUpdater(updater, 0);

    const nextFunc = (arg1: any) => {
      const copy = { ...arg1 };
      if (copy?.value) {
        copy.value += "!";
      }
      return copy;
    };

    expect(node.children[0].value).toEqual("hello world");

    stateUpdater(nextFunc);
    expect(node.children[0].value).toEqual("hello world");
    expect(updatedNode.children[0].value).toEqual("hello world!");
  });

  it("With function mutating node", () => {
    let node: any = {
      type: "Brackets",
      children: [{ type: "Comment", value: "hello world" }]
    };

    const updater: StateUpdater<StyleNodeWithChildren> = ((
      reducer: (current: StyleNodeWithChildren) => StyleNodeWithChildren
    ) => {
      node = reducer(node);
    }) as StateUpdater<StyleNodeWithChildren>;

    const stateUpdater = createChildUpdater(updater, 0);

    const nextFunc = (arg1: any) => {
      const copy = { ...arg1 };
      if (copy?.value) {
        copy.value += "!";
      }
      return copy;
    };

    expect(node.children[0].value).toEqual("hello world");

    stateUpdater(nextFunc);
    expect(node.children[0].value).toEqual("hello world!");

    stateUpdater(nextFunc);
    expect(node.children[0].value).toEqual("hello world!!");

    stateUpdater(nextFunc);
    expect(node.children[0].value).toEqual("hello world!!!");
  });

  it("Without function", () => {
    const node1: any = {
      type: "Brackets",
      children: [{ type: "Comment", value: "hello world" }]
    };

    const node2: any = { type: "Comment", value: "hello world!" };

    let updatedNode: any;
    const updater: StateUpdater<StyleNodeWithChildren> = ((
      reducer: (current: StyleNodeWithChildren) => StyleNodeWithChildren
    ) => {
      updatedNode = reducer(node1);
    }) as StateUpdater<StyleNodeWithChildren>;

    const stateUpdater = createChildUpdater(updater, 0);

    expect(node1.children[0].value).toEqual("hello world");
    stateUpdater(node2);
    expect(updatedNode.children[0].value).toEqual("hello world!");
  });
});

describe("createUpdater", () => {
  it("With function", () => {
    let node: any = {
      type: "Brackets",
      children: [{ type: "Comment", value: "hello world" }]
    };

    const selector = (prev: any) => prev.children[0];

    const updater = (
      clonedNode: StyleNodeWithChildren,
      child: CssNodePlain
    ) => {
      clonedNode.children[0] = child;
      return clonedNode;
    };

    const props = {
      node,
      setNode: ((
        reducer: (current: StyleNodeWithChildren) => StyleNodeWithChildren
      ) => {
        node = reducer(node);
      }) as StateUpdater<StyleNodeWithChildren>
    };

    const stateUpdater = createUpdater(props, selector, updater);

    const nextFunc = (arg1: any) => {
      const copy = { ...arg1 };
      if (copy?.value) {
        copy.value += "!";
      }
      return copy;
    };

    expect(node.children[0].value).toEqual("hello world");

    stateUpdater(nextFunc);
    expect(node.children[0].value).toEqual("hello world!");

    stateUpdater(nextFunc);
    expect(node.children[0].value).toEqual("hello world!!");
  });

  it("With function mutability", () => {
    let node: any = {
      type: "Brackets",
      children: [{ type: "Comment", value: "hello world" }]
    };

    const selector = (prev: any) => prev.children[0];

    const updater = (
      clonedNode: StyleNodeWithChildren,
      child: CssNodePlain
    ) => {
      clonedNode.children[0] = child;
      return clonedNode;
    };

    const props = {
      node,
      setNode: ((
        reducer: (current: StyleNodeWithChildren) => StyleNodeWithChildren
      ) => {
        node = reducer(node);
      }) as StateUpdater<StyleNodeWithChildren>
    };

    const stateUpdater = createUpdater(props, selector, updater);
    const node2: any = { type: "Number", value: "5" };

    expect(node.children[0].value).toEqual("hello world");

    stateUpdater(node2);
    expect(node.children[0].value).toEqual("5");
    expect(node.children[0].type).toEqual("Number");
  });

  it("Without function", () => {
    const node: any = { type: "Comment", value: "hello world" };

    let updatedNode: any;

    const selector = (prev: any) => prev.value;

    const updater = (clonedNode: any, child: CssNodePlain) => {
      clonedNode.value = child;
      return clonedNode;
    };

    const props = {
      node,
      setNode: ((
        reducer: (current: StyleNodeWithChildren) => StyleNodeWithChildren
      ) => {
        updatedNode = reducer(node);
        updatedNode;
      }) as StateUpdater<StyleNodeWithChildren>
    };

    const stateUpdater = createUpdater(props, selector, updater);

    const newValue: any = "updated!";

    expect(node.value).toEqual("hello world");
    expect(node.type).toEqual("Comment");

    stateUpdater(newValue);
    expect(node.value).toEqual("hello world");
    expect(node.type).toEqual("Comment");

    expect(updatedNode.value).toEqual("updated!");
    expect(updatedNode.type).toEqual("Comment");
  });
});
