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
    let dataJson:any;
    try{
      // const handle = await exec('npm run build',{
      //   cwd: path.resolve(__dirname,"../my-kitchen-sink/"),
      // });  
      // console.log(handle.stdout);
      const dataStr = await fs.readFile(
        path.resolve(__dirname,"../my-kitchen-sink/", 'raisins.json'),
        { encoding: 'utf-8' }
      );
      if(!dataStr) throw new Error();
      dataJson = JSON.parse(dataStr);
    }catch(e){
      throw new Error("The kitchen sink build output is missing or empty. Run `cd my-kitchen-sink && npm run build` before tests")
    }

    const validator = new Ajv();
    const validate = validator.compile(schema);
    const valid = validate(dataJson);
    if (!valid) throw validate.errors;
  });
});
