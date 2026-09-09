import Ajv from 'ajv';
import fsSync from 'fs';
// import childProcess from 'child_process';
// import { promisify } from 'util';
import path from 'path';
// const exec = promisify(childProcess.exec);
const fs = fsSync.promises;

// JSON file
const schema = require('@raisins/schema');
const kitchenSinkPath = path.resolve(
  __dirname,
  '../../../examples/my-kitchen-sink'
);

describe('Stencil docs target', () => {
  it('builds and matches schema', async () => {
    let dataJson: any;
    try {
      // const handle = await exec('npm run build',{
      //   cwd: path.resolve(__dirname,"../my-kitchen-sink/"),
      // });
      // console.log(handle.stdout);
      const dataStr = await fs.readFile(
        path.resolve(kitchenSinkPath, 'raisins.json'),
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

    expect(component.cssParts).toEqual([
      { name: 'greeting', description: 'The greeting text container' },
      { name: 'date', description: 'The formatted date text' },
    ]);
    expect(component.cssProperties).toEqual([
      {
        name: '--my-ui-component-color',
        description: 'Controls the greeting text color',
      },
      {
        name: '--my-ui-component-date-color',
        description: 'Controls the date text color',
      },
    ]);
  });

  it('omits css parts and properties for components without them', async () => {
    const dataStr = await fs.readFile(
      path.resolve(kitchenSinkPath, 'docs', 'raisins.json'),
      { encoding: 'utf-8' }
    );
    const tags = JSON.parse(dataStr).modules.flatMap((m: any) => m.tags ?? []);
    const component = tags.find((t: any) => t.tagName === 'my-card');

    expect(component.cssParts).toBeUndefined();
    expect(component.cssProperties).toBeUndefined();
  });
});
