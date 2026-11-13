import { autoBindSteps } from "@saasquatch/scoped-autobindsteps";
import { parseFeature, type StepDefinitions } from "jest-cucumber";

/**
 * Binds step definitions to a Gherkin feature. Takes the feature's text (e.g. a `?raw` import)
 * rather than a path so it works in both the Node and browser test projects.
 */
export function bindIsomorphicCucumberSteps(
  stepDefs: IsoStepDefs,
  featureText: string,
) {
  const feature = parseFeature(featureText);

  const steps: StepDefinitions = ({ defineStep }) => {
    stepDefs(defineStep, defineStep, defineStep, defineStep);
  };

  autoBindSteps([feature], [steps]);
}
export type DefineIsoStepDef = (...args: any[]) => void;
export type IsoStepDefs = (...args: DefineIsoStepDef[]) => unknown;
