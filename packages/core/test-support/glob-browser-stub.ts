export function sync(): never {
  throw new Error(
    "glob.sync is unavailable in browser tests; import feature text with ?raw instead.",
  );
}
