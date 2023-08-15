// TODO remove zlib from package.json

import * as fs from 'fs';
import * as readline from 'node:readline';
import zlib from 'zlib';
import { getClient } from '@/util/elasticsearch/client';
import {
  bulk,
  createIndexIfNotExist,
  getBulkOperationArray,
} from '@/util/elasticsearch/import';
import { searchAll } from '@/util/elasticsearch/search/search';
import { processDocumentImage } from '@/util/image/imageProcessor';
import csvParser from 'csv-parser';

import type { ElasticsearchIngester } from '@/types/elasticsearchIngester';
import { TermIdMap } from '@/types/term';

async function* readFileData(
  filename: string
): AsyncGenerator<any, void, unknown> {
  const isJsonl = filename.endsWith('.jsonl');
  const isCompressedJsonl = filename.endsWith('.jsonl.gz');
  const isCsv = filename.endsWith('.csv');
  const isCompressedCsv = filename.endsWith('.csv.gz');

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
  } else {
    throw new Error(`Unsupported file format for ${filename}`);
  }
}

/**
 * Update data in Elasticsearch from a jsonl file (one JSON object per row, no endline commas)
 *
 * @param indexName  Name of the index.
 * @param dataFilename  Name of the file containing the data.
 * @param ingester  Ingester with properties & functions to transform a dataset.
 * @param sourceName  Name of the sourceName.
 * @param includeSourcePrefix  Whether to include the source id prefix in the document ID.
 */
export default async function updateFromFile(
  ingester: ElasticsearchIngester,
  includeSourcePrefix = false
) {
  const indexName = ingester.indexName;
  const dataFilename = ingester.dataFilename;
  console.log(`Updating ${indexName} from ${dataFilename}...`);
  const bulkLimit = parseInt(process.env.ELASTICSEARCH_BULK_LIMIT || '1000');
  const maxBulkOperations = bulkLimit * 2;
  const client = getClient();
  await createIndexIfNotExist(client, indexName);
  const allIds: string[] = [];
  let allTerms: TermIdMap = {};
  let operations: any[] = [];

  for await (const obj of readFileData(dataFilename)) {
    try {
      if (obj) {
        const doc = await ingester.transform(obj);
        if (doc !== undefined) {
          const id = ingester.generateId(doc, includeSourcePrefix);

          // Process our own version of image:
          if (doc?.image?.url) {
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
          }

          if (ingester.extractTerms !== undefined) {
            const termElements = await ingester.extractTerms(doc);
            if (termElements) {
              allTerms = { ...allTerms, ...termElements };
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
  const hits: any[] = await searchAll(
    indexName,
    {
      match: {
        source: ingester.sourceName,
      },
    },
    ['id']
  );

  const esAllIds = hits.map((hit) => hit._id);

  console.log('Got existing index ids: ' + esAllIds?.length);

  const allIdsSet = new Set(allIds);
  const idsToDelete = [...esAllIds].filter((id) => !allIdsSet.has(id));

  console.log('Deleting ' + idsToDelete.length + ' ids');

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
