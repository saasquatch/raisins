import parse from "../html-dom/parser";
import { CustomElement } from "@raisins/schema/schema";
import { calculatePlopTargets } from "./calculatePlopTargets";

describe("", () => {
  it("", () => {
    const parent = parse("<div></div>");
    const possiblePlop = parse("<span></span>");

    const parentMeta: CustomElement = {
		tagName: ""
	};
    const possiblePlopMeta: CustomElement = {
		tagName: ""
	};
    const schema = {
		parentMeta,
		possiblePlopMeta
	};

    const res = calculatePlopTargets(parent, possiblePlop, schema);

    console.log(res);
  });
});
