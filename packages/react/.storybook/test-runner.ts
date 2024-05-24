import { TestRunnerConfig } from '@storybook/test-runner';
import path from 'node:path';

let number = 1;

const config: TestRunnerConfig = {
  async prepare(context) {
    await context.browserContext.exposeFunction(
      '__screenshot',
      async (name?: string) => {
        await context.page.screenshot({
          path: path.resolve(
            __dirname,
            '../.screenshots/',
            name ?? number + '.png'
          ),
        });
      }
    );
  },
  tags: {
    // include: ['end2end'],
    skip: ['flakey'],
  },
};

export default config;
