import * as fs from 'fs';
import * as readline from 'node:readline';
import zlib from 'zlib';
import csvParser from 'csv-parser';
import path from 'path';

import type { ElasticsearchIngester } from '@/types/elasticsearchIngester';
import {  TermDocumentIdMap } from '@/types/document';
import { getClient } from '@/lib/elasticsearch/client';
import {
  bulk,
  createIndexIfNotExist,
  getBulkOperationArray,
} from '@/lib/elasticsearch/import';
import { searchAll } from '@/lib/elasticsearch/search/searchAll';
import { processDocumentImage } from '@/lib/image/imageProcessor';

async function* readFileData(
  filename: string
): AsyncGenerator<any, void, unknown> {
  const stat = await fs.promises.stat(filename);

  if (stat.isDirectory()) {
    const entries = await fs.promises.readdir(filename, { withFileTypes: true });
    const sortedEntries = entries
      .filter((entry) => !entry.name.startsWith('.'))
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of sortedEntries) {
      const fullPath = path.join(filename, entry.name);
      yield* readFileData(fullPath);
    }
    return;
  }

  const isJsonl = filename.endsWith('.jsonl');
  const isCompressedJsonl = filename.endsWith('.jsonl.gz');
  const isCsv = filename.endsWith('.csv');
  const isCompressedCsv = filename.endsWith('.csv.gz');
  const isJson = filename.endsWith('.json') && !isJsonl;

  let inputStream: NodeJS.ReadableStream;
  if (isCompressedJsonl || isCompressedCsv) {
    inputStream = fs.createReadStream(filename).pipe(zlib.createGunzip());
  } else {
    inputStream = fs.createReadStream(filename);
  }

  if (isJsonl || isCompressedJsonl) {
    const fileStream = readline.createInterface({
      input: inputStream,
      crlfDelay: Infinity,
    });
    for await (const line of fileStream) {
      try {
        const obj = JSON.parse(line);
        yield obj;
      } catch (err) {
        console.error(`Error parsing JSON line ${line}: ${err}`);
      }
    }
  } else if (isCsv || isCompressedCsv) {
    const csvStream = inputStream.pipe(csvParser());
    for await (const row of csvStream) {
      yield row;
    }
  } else if (isJson) {
    try {
      const raw = await fs.promises.readFile(filename, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        for (const obj of data) {
          yield obj;
        }
      } else if (data) {
        yield data;
      }
    } catch (err) {
      console.error(`Error parsing JSON file ${filename}: ${err}`);
    }
  } else {
    throw new Error(`Unsupported file format for ${filename}`);
  }
}

/**
 * Update data in Elasticsearch from a jsonl file (one JSON object per row, no endline commas)
 *
 * @param ingester  Ingester with properties & functions to transform a dataset.
 * @param includeSourcePrefix  Whether to include the source id prefix in the document ID.
 */
interface UpdateFromFileOptions {
  clearSourceIds?: string[];
}

export default async function updateFromFile(
  ingester: ElasticsearchIngester,
  includeSourcePrefix = false,
  options: UpdateFromFileOptions = {}
) {
  const indexName = ingester.indexName;
  const dataFilename = ingester.dataFilename;
  console.log(`Updating ${indexName} from ${dataFilename}...`);
  const bulkLimit = parseInt(process.env.ELASTICSEARCH_BULK_LIMIT || '1000');
  const isProcessImages = process.env.PROCESS_IMAGES === 'true';
  const maxBulkOperations = bulkLimit * 2;
  const client = getClient();
  await createIndexIfNotExist(client, indexName);
  if (Array.isArray(options.clearSourceIds) && options.clearSourceIds.length) {
    for (const sourceId of options.clearSourceIds) {
      if (!sourceId) continue;
      console.log(
        `Clearing existing ${indexName} documents for sourceId "${sourceId}"...`
      );
      await client.deleteByQuery({
        index: indexName,
        conflicts: 'proceed',
        refresh: true,
        body: {
          query: {
            term: {
              sourceId: sourceId,
            },
          },
        },
      });
    }
  }
  const allIds: string[] = [];
  const idsBySourceId = new Map<string, Set<string>>();
  let allTerms:  TermDocumentIdMap = {};
  let operations: any[] = [];

  for await (const obj of readFileData(dataFilename)) {
    try {
      if (obj) {
        const doc = await ingester.transform(obj);
        if (doc !== undefined) {
          const id = ingester.generateId(doc, includeSourcePrefix);

          // Process our own version of image:
          if (isProcessImages && doc?.image?.url) {
            const isImageSuccess = await processDocumentImage(
              doc.image.url,
              id,
              indexName
            );
            if (!isImageSuccess) {
              // Sometimes images aren't actually available
              doc.image = undefined;
            }
          }

          if (doc && id) {
            operations.push(
              ...getBulkOperationArray('update', indexName, id, doc)
            );
            allIds.push(id);
            const docSourceId = doc.sourceId || ingester.sourceId;
            if (docSourceId) {
              if (!idsBySourceId.has(docSourceId)) {
                idsBySourceId.set(docSourceId, new Set<string>());
              }
              idsBySourceId.get(docSourceId)!.add(id);
            }
          }

          if (ingester.extractTerms !== undefined) {
            const termElements = await ingester.extractTerms(doc);
            if (termElements) {
              for (const [termId, term] of Object.entries(termElements)) {
                allTerms[termId] = term;
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(`Error parsing object ${obj}: ${err}`);
    }

    if (operations.length >= maxBulkOperations) {
      await bulk(client, operations);
      operations = [];
    }
  }
  if (operations.length > 0) {
    await bulk(client, operations);
  }

  // Update terms index
  if (allTerms) {
    const termOperations: any[] = [];
    for (const _id in allTerms) {
      if (allTerms?.[_id]) {
        const term = allTerms[_id];
        termOperations.push(
          ...getBulkOperationArray('update', 'terms', _id, term)
        );
      }
    }
    if (termOperations.length > 0) {
      // Create terms index if doesn't exist
      await createIndexIfNotExist(client, 'terms');
      // TODO: chunk terms into manageable sizes
      await bulk(client, termOperations);
    }
  }

  // Delete ids not present in data file
  const sourcesToSweep =
    idsBySourceId.size > 0
      ? idsBySourceId
      : new Map([[ingester.sourceId, new Set(allIds)]]);

  for (const [sourceId, idsSet] of sourcesToSweep.entries()) {
    const hits: any[] = await searchAll(
      indexName,
      {
        match: {
          sourceId,
        },
      },
      ['id']
    );

    const esAllIds = hits.map((hit) => hit._id);
    console.log(
      `Source ${sourceId}: found ${esAllIds.length} existing index ids.`
    );

    const idsToDelete = esAllIds.filter((id) => !idsSet.has(id));
    if (idsToDelete.length === 0) continue;

    console.log(
      `Source ${sourceId}: deleting ${idsToDelete.length} stale ids.`
    );

    const deleteChunkSize = 10000;
    for (let i = 0; i < idsToDelete.length; i += deleteChunkSize) {
      const chunk = idsToDelete.slice(i, i + deleteChunkSize);
      await client.deleteByQuery({
        index: indexName,
        body: {
          query: {
            ids: {
              values: chunk,
            },
          },
        },
      });
    }
  }
}
