export async function waitForUpdate(ms = 1) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
