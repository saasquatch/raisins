import { And, Given, Then } from "cypress-cucumber-preprocessor/steps";
import expect from "expect";
import { isHtmlEquivalent } from "../../../src/html-dom/isHtmlEquivalent";

var html_a: string;
var html_b: string;
var ignoreComments: boolean = false;

Given(/^one HTML string (.*)$/, (html: string) => {
  html_a = html;
});

And(/^another HTML string (.*)$/, (html: string) => {
  html_b = html;
});

And(/^ignoreComments option is true$/, () => {
  ignoreComments = true;
});

Then(/^they will be equivalent$/, () => {
  expect(isHtmlEquivalent(html_a, html_b, { ignoreComments })).toBe(true);
});

Then(/^they will not be equivalent$/, () => {
  expect(() => {
    isHtmlEquivalent(html_a, html_b);
  }).toThrowError();
});
