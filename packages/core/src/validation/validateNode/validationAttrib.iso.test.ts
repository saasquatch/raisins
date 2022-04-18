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

    date = "2020-07-07T12:00:00+08:00/2021-08-08T12:00:00+08:00";
    date = "2020-07-07T12:00:00+08:00/2021-08-08T12:00:00+08:00";
    // date = "2021-12-31/2021-12-31";
	// Check with Scott leaderboard interval filter

    console.log("isValidDateInterval", isValidDateInterval(date));
    console.log("\n");

    var url;
    // url = "https://www.digi.com/resources/documentation/digidocs/90001437-13/reference/r_iso_8601_duration_format.htm";
    url = "www.asd.com";
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

	// test and specs

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

    console.log(validateAttributes(node, [meta]));
    // console.log(validateAttributes(node, [meta])[0]?.error || "no errors :)");
  });
});
