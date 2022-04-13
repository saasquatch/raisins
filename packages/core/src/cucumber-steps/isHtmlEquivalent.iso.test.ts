import {
  And as and,
  Given as given,
  Then as then
} from "cypress-cucumber-preprocessor/steps";
import expect from "expect";
import { StepDefinitions } from "jest-cucumber";
import { isHtmlEquivalent } from "../html-dom/isHtmlEquivalent";

const JEST = process.env.JEST_WORKER_ID !== undefined;

const cucumber = (
  given: (...args: any[]) => void,
  and: (...args: any[]) => void,
  then: (...args: any[]) => void
) => {
  var html_a: string;
  var html_b: string;
  var ignoreComments: boolean = false;

  given(/^one HTML string (.*)$/, (html: string) => {
    html_a = html;
  });

  and(/^another HTML string (.*)$/, (html: string) => {
    html_b = html;
  });

  and(/^ignoreComments option is true$/, () => {
    ignoreComments = true;
  });

  then(/^they will be equivalent$/, () => {
    expect(isHtmlEquivalent(html_a, html_b, { ignoreComments })).toBe(true);
  });

  then(/^they will not be equivalent$/, () => {
    expect(() => {
      isHtmlEquivalent(html_a, html_b);
    }).toThrowError();
  });
};

var jestSteps: StepDefinitions = () => {};

if (!JEST) {
  cucumber(given, and, then);
} else {
  const jest_cucumber = require("jest-cucumber");

  const feature = jest_cucumber.loadFeature(
    "../html-dom/isHtmlEquivalent.feature",
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
