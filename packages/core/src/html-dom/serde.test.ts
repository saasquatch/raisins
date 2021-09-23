import { parse } from "./parser";
import serializer from "./serializer";

describe("Parse + serialize", () => {
  test("Can parse simple HTML", () => {
    const source = `<div>Example</div>`;
    const node = parse(source);
    expect(node).toMatchSnapshot();

    const out = serializer(node);

    expect(out).toBe(source);
  });
});
