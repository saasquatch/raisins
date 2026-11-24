import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const browserTests = "src/**/*.web.test.{ts,tsx}";

export default defineConfig({
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "jsdom",
          include: ["src/**/*.test.{ts,tsx}"],
          exclude: ["node_modules", browserTests],
        },
      },
      {
        extends: true,
        // The canvas iframe is sandboxed (origin "null") and imports its runtime as ES modules
        server: { cors: { origin: "null" } },
        test: {
          name: "browser",
          include: [browserTests],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
