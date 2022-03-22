import { autoBindSteps, loadFeature, StepDefinitions } from "jest-cucumber";
import { isHtmlEquivalent } from "./isHtmlEquivalent";

const feature = loadFeature("./isHtmlEquivalent.feature", {
  loadRelativePath: true,
  tagFilter: "not @skip"
});

export const htmlEquivalencySteps: StepDefinitions = ({ given, and, then }) => {
  var html_a: string;
  var html_b: string;

  given(/^one HTML string (.*)$/, (html: string) => {
    html_a = html;
  });

  and(/^another HTML string (.*)$/, (html: string) => {
    html_b = html;
  });

  then(/^they will be equivalent$/, () => {
    expect(isHtmlEquivalent(html_a, html_b)).toBe(true);
  });

  then(/^they will not be equivalent$/, () => {
    expect(() => {
      isHtmlEquivalent(html_a, html_b);
    }).toThrowError();
  });
};

autoBindSteps([feature], [htmlEquivalencySteps]);
