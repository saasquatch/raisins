declare global {
  interface Window {
    __screenshot?: () => Promise<void>;
  }
}

/**
 * Take a screenshot in a storybook test environment.
 *
 * See `.storybook/test-runner.ts` for the playwright code that powers this
 */
export async function screenshot() {
  if (window.__screenshot) {
    await window.__screenshot();
  }
}
