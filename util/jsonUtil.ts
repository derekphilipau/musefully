import * as fs from 'fs';
import * as readline from 'node:readline';
import zlib from 'zlib';  // TODO remove zlib from package.json

export async function loadJsonFile(filePath: string) {
  const fileStream = fs.createReadStream(filePath).pipe(zlib.createGunzip());
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  let documents: any[] = [];
  for await (const line of rl) {
    try {
      const obj = line ? JSON.parse(line) : undefined;
      if (obj !== undefined) {
        documents.push(obj);
      }
    } catch (err) {
      console.error(`Error parsing line ${line}: ${err}`);
    }
  }
  return documents;
}
