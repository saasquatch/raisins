import { autoBindSteps } from "@saasquatch/scoped-autobindsteps";
import { defineStep } from "cypress-cucumber-preprocessor/steps";
import { StepDefinitions } from "jest-cucumber";

const JEST = process.env.JEST_WORKER_ID !== undefined;

export function bindIsomorphicCucumberSteps(
  stepDefs: IsoStepDefs,
  file: string
) {
  if (!JEST) {
    stepDefs(defineStep, defineStep, defineStep, defineStep);
  } else {
    const jest_cucumber = require("jest-cucumber");

    const feature = jest_cucumber.loadFeature(file, {
      loadRelativePath: true
    });

    var jestSteps: StepDefinitions = ({ defineStep }) => {
      stepDefs(defineStep, defineStep, defineStep, defineStep);
    };

    autoBindSteps([feature], [jestSteps]);
  }
}
export type DefineIsoStepDef = (...args: any[]) => void;
export type IsoStepDefs = (...args: DefineIsoStepDef[]) => unknown;
