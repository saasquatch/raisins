import path from 'path';
import fsSync from "fs";
export const fs = fsSync.promises;

/**
 * Writes a file, ensuring that the directory exitss first
 *
 * @param outDir
 * @param file
 * @param content
 */
export async function writeFile(outDir: string, file: string, content: string) {
  if (!fsSync.existsSync(outDir)) {
    await fs.mkdir(outDir, { recursive: true });
  }
  await fs.writeFile(path.resolve(outDir, file), content, {
    encoding: 'utf-8',
  });
}
