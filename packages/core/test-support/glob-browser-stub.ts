// jest-cucumber imports `glob` at load time, but only uses it in `loadFeatures(pattern)`, which these tests
// don't call. The real package touches Node's `fs` on import, so the browser project aliases it to this stub.
export const sync = (): string[] => [];
export const globSync = sync;
export default { sync, globSync };
