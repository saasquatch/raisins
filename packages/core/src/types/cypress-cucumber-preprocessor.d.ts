// The runtime module is `steps.js`, but its types live in `@types/cypress-cucumber-preprocessor/steps/index.d.ts`,
// which NodeNext resolution doesn't map to the extensionless `/steps` specifier.
declare module "cypress-cucumber-preprocessor/steps" {
  export * from "cypress-cucumber-preprocessor/steps/index.js";
}
