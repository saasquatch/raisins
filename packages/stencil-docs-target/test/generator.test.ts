import Ajv from 'ajv';
import fsSync from 'fs';
import childProcess from 'child_process';
import { promisify } from 'util';
import path from 'path';
const exec = promisify(childProcess.exec);
const fs = fsSync.promises;

// JSON file
const schema = require('@raisins/schema');

describe('Stencil docs target', () => {
  it('builds and matches schema', async () => {
    try{
      await exec('npm i && npm run build',{
        cwd: path.resolve(__dirname,"../my-kitchen-sink/"),
      });  
    }catch(e){
      throw new Error("The kitchen sink build failed. Run `cd my-kitchen-sink && npm run build` to diagnose")
    }
    const dataStr = await fs.readFile(
      path.resolve(__dirname,"../my-kitchen-sink/", 'raisins.json'),
      { encoding: 'utf-8' }
    );
    const dataJson = JSON.parse(dataStr);
    const validator = new Ajv();
    const validate = validator.compile(schema);
    const valid = validate(dataJson);
    if (!valid) throw validate.errors;
  });
});
