import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm"],
  platform: "node",
  fixedExtension: true,
  dts: true,
  sourcemap: true,
});
