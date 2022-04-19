import { CustomElement } from "@raisins/schema/schema";
import { RaisinElementNode } from "../../html-dom/RaisinNode";
import { validateAttributes } from "./validateNode";

describe("", () => {
  it("", () => {
    const meta: CustomElement = {
      tagName: "",
      attributes: [
        { name: "speed", type: "number" },
        {
          name: "brand",
          type: "string",
          required: true,
          enum: ["bmw", "mercedes", "audi"]
        },
        {
          name: "color",
          type: "string",
          format: "color"
        }
      ]
    };

    const node: RaisinElementNode = {
      type: "tag",
      attribs: {
        brand: "bmw",
        color: "salmon"
      },
      tagName: "",
      children: []
    };

    console.log(validateAttributes(node, [meta])[0]?.error || "no errors :)");
  });
});
