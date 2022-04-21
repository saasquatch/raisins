import expect from "expect";
import { getNode, getPath, RaisinDocumentNode } from "../../src";
import parse from "../../src/html-dom/parser";
import selector from "../../src/html-dom/selector";

describe("Paths", () => {
  test("In matches out", () => {
    const html = "<span>Text and <b>Peer</b><b>Bold</b><b>Tags</b></span>";
    const input = parse(html);

    expectSelectorToBePath(input, "span", [0]);
    expectSelectorToBePath(input, "b:first-child", [0, 1]);
    expectSelectorToBePath(input, "b:nth-child(2)", [0, 2]);
    expectSelectorToBePath(input, "b:nth-child(3)", [0, 3]);
  });
});

function expectSelectorToBePath(
  input: RaisinDocumentNode,
  slt: string,
  path: number[]
) {
  const sub = selector(input, slt)[0];
  const foundNode = getNode(input, path);
  expect(foundNode).toBe(sub);
  const foundPath = getPath(input, foundNode);
  expect(foundPath).toEqual(path);
}
