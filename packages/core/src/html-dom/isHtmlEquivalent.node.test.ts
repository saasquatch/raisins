import expect from "expect";
import { autoBindSteps, loadFeature, StepDefinitions } from "jest-cucumber";
import { isHtmlEquivalent } from "./isHtmlEquivalent";

const feature = loadFeature("./isHtmlEquivalent.feature", {
  loadRelativePath: true
});

export const htmlEquivalencySteps: StepDefinitions = ({ given, and, then }) => {
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

autoBindSteps([feature], [htmlEquivalencySteps]);
