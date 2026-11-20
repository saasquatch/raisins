import Ajv from 'ajv';
import fsSync from 'fs';
import schema from '@raisins/schema' with { type: "json" };
import path from 'path';
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const fs = fsSync.promises;

const kitchenSinkPath = path.resolve(
  import.meta.dirname,
  '../../../examples/my-kitchen-sink'
);

describe('Stencil docs target', () => {
  it('builds and matches schema', async () => {
    let dataJson: any;
    try {
      const dataStr = await fs.readFile(
        path.resolve(kitchenSinkPath, 'docs', 'raisins.json'),
        { encoding: 'utf-8' }
      );
      if (!dataStr) throw new Error();
      dataJson = JSON.parse(dataStr);
    } catch (e) {
      throw new Error(
        'The kitchen sink build output is missing or empty. Run `cd my-kitchen-sink && npm run build` before tests'
      );
    }

    const validator = new Ajv();
    const validate = validator.compile(schema);
    const valid = validate(dataJson);
    if (!valid) throw validate.errors;
  });
  it('contains custom uiSchema properties', async () => {
    const dataStr = await fs.readFile(
      path.resolve(kitchenSinkPath, 'docs', 'raisins.json'),
      { encoding: 'utf-8' }
    );
    if (!dataStr) throw new Error();
    if (!dataStr.includes('uiWidgetOptions'))
      throw new Error('No uiWidgetOptions found');
    if (!dataStr.includes('uiWidget')) throw new Error('No uiWidget found');
    if (!dataStr.includes('slots')) throw new Error('No slots found');
    if (!dataStr.includes('validChildren'))
      throw new Error('No validChildren found');
    if (!dataStr.includes('validParents'))
      throw new Error('No validParents found');
    if (!dataStr.includes('exampleGroup'))
      throw new Error('No exampleGroup found');
    if (!dataStr.includes('slotEditor')) throw new Error('No slotEditor found');
    if (!dataStr.includes('canvasRenderer'))
      throw new Error('No canvasRenderer found');
    if (!dataStr.includes('required')) throw new Error('No required found');
    if (dataStr.includes('undocumentedField'))
      throw new Error('undocumented prop found');
    if (!dataStr.includes('default'))
      throw new Error('undocumented prop found');
    // if (!dataStr.includes('ui:order')) throw new Error('No ui:order found');
  });

  it('contains css parts and properties for the annotated component', async () => {
    const dataStr = await fs.readFile(
      path.resolve(kitchenSinkPath, 'docs', 'raisins.json'),
      { encoding: 'utf-8' }
    );
    const tags = JSON.parse(dataStr).modules.flatMap((m: any) => m.tags ?? []);
    const component = tags.find((t: any) => t.tagName === 'my-ui-component');

    assert.equal(JSON.stringify(component.cssParts), JSON.stringify([
      { name: 'greeting', description: 'The greeting text container' },
      { name: 'date', description: 'The formatted date text' },
    ]));
    assert.equal(JSON.stringify(component.cssProperties), JSON.stringify([
      {
        name: '--my-ui-component-date-color',
        description: 'Controls the date text color',
      },
    ]));
  });

  it('omits css parts and properties for components without them', async () => {
    const dataStr = await fs.readFile(
      path.resolve(kitchenSinkPath, 'docs', 'raisins.json'),
      { encoding: 'utf-8' }
    );
    const tags = JSON.parse(dataStr).modules.flatMap((m: any) => m.tags ?? []);
    const component = tags.find((t: any) => t.tagName === 'my-card');

    assert.equal(component.cssParts, undefined);
    assert.equal(component.cssProperties, undefined);
  });
});
