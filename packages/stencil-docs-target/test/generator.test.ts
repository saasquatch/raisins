import Ajv from 'ajv';
import fsSync from 'fs';
// import childProcess from 'child_process';
// import { promisify } from 'util';
import path from 'path';
// const exec = promisify(childProcess.exec);
const fs = fsSync.promises;

// JSON file
const schema = require('@raisins/schema');

describe('Stencil docs target', () => {
  it('builds and matches schema', async () => {
    let dataJson: any;
    try {
      // const handle = await exec('npm run build',{
      //   cwd: path.resolve(__dirname,"../my-kitchen-sink/"),
      // });
      // console.log(handle.stdout);
      const dataStr = await fs.readFile(
        path.resolve(__dirname, '../my-kitchen-sink/', 'raisins.json'),
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
      path.resolve(__dirname, '../my-kitchen-sink/docs', 'raisins.json'),
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
    // if (!dataStr.includes('ui:order')) throw new Error('No ui:order found');
  });
});
