import { CustomElement } from "@raisins/schema/schema";
import { RaisinElementNode } from "../../html-dom/RaisinNode";
import { validateAttributes } from "./validateNode";
import validateColor from "validate-color";
import { parseToRgba } from "color2k";

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

    // COLOR TEST
    const color = "inherit";
    console.log("validateColor:", color, validateColor(color));
    console.log("isValidColor:", color, isValidColor(color));
    console.log("\n");

    var date;

    date = "2021-12-31T08:00:00.000Z/2022-12-31T08:00:00.000Z";
    // date = "2021-12-31/2021-12-31";

    console.log("isValidDateInterval", isValidDateInterval(date));
    console.log("\n");

    var url;
    url = "https://www.kutaycinar.com";
    // url = "localhost:3000";
    console.log("isValidURL", isValidURL(url));

    function isValidDateInterval(value: string): boolean {
      const dates = value.split("/");
      // if there are not exactly 2 dates, it is not a valid interval
      if (dates.length !== 2) return false;
      // if both are valid dates, then it is a valid date interval
      if (isValidDate(dates[0]) && isValidDate(dates[1])) return true;
      return false;
    }

    function isValidColor(value: string): boolean {
      try {
        parseToRgba(value);
      } catch {
        return false;
      }
      return true;
    }

    /*
	const whitelist = ["currentColor", "var(--sl-color-sunshine-500)"];
	// CSS variable support inherit/currentColor
	// var(--sl-***-**)
    if (whitelist.includes(value)) return true;
	*/

    function isValidURL(value: string): boolean {
      try {
        new URL(value);
      } catch {
        return false;
      }
      return true;
    }

    function isValidDate(value: string): boolean {
      return new Date(value).toJSON() === value;
    }

    // console.log(validateAttributes(node, [meta]));
    // console.log(validateAttributes(node, [meta])[0]?.error || "no errors :)");
  });
});
