import { fileURLToPath } from "node:url";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Cucumber step binding (scoped-autobindsteps) relies on global `describe`/`test`
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "jsdom",
          include: ["src/**/*.{iso,node}.test.ts"],
        },
      },
      {
        extends: true,
        resolve: {
          alias: {
            glob: fileURLToPath(
              new URL("./test-support/glob-browser-stub.ts", import.meta.url),
            ),
          },
        },
        test: {
          name: "browser",
          include: ["src/**/*.{iso,web}.test.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
    coverage: {
      include: ["src/**/*.ts"],
    },
  },
});
