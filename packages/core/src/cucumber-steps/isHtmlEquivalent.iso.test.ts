import expect from "expect";
import { isHtmlEquivalent } from "../html-dom/isHtmlEquivalent";
import { bindIsomorphicCucumberSteps } from "./bindIsomorphicCucumberSteps";

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

bindIsomorphicCucumberSteps(cucumber, "../html-dom/isHtmlEquivalent.feature");
