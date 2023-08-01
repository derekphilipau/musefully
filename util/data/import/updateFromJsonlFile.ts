// TODO remove zlib from package.json
import { getClient } from '@/util/elasticsearch/client';
import {
  bulk,
  createIndexIfNotExist,
  getBulkOperationArray,
  getReadlineInterface,
} from '@/util/elasticsearch/import';
import { searchAll } from '@/util/elasticsearch/search/search';

import type { ElasticsearchTransformer } from '@/types/elasticsearchTransformer';
import { TermIdMap } from '@/types/term';

/**
 * Update data in Elasticsearch from a jsonl file (one JSON object per row, no endline commas)
 *
 * @param indexName  Name of the index.
 * @param dataFilename  Name of the file containing the data.
 * @param transformer  Transformer object with functions to transform the data.
 * @param source  Name of the source.
 * @param includeSourcePrefix  Whether to include the source prefix in the document ID.
 */
export default async function updateFromJsonlFile(
  indexName: string,
  dataFilename: string,
  transformer: ElasticsearchTransformer,
  source: string,
  includeSourcePrefix = false
) {
  const bulkLimit = parseInt(process.env.ELASTICSEARCH_BULK_LIMIT || '1000');
  const maxBulkOperations = bulkLimit * 2;
  const client = getClient();
  await createIndexIfNotExist(client, indexName);
  const rl = getReadlineInterface(dataFilename);

  const allIds: string[] = [];
  let allTerms: TermIdMap = {};
  let operations: any[] = [];
  for await (const line of rl) {
    try {
      const obj = line ? JSON.parse(line) : undefined;
      if (obj !== undefined) {
        const doc = await transformer.documentTransformer(obj);
        if (doc !== undefined) {
          const id = transformer.idGenerator(doc, includeSourcePrefix);
          if (doc && id) {
            operations.push(
              ...getBulkOperationArray('update', indexName, id, doc)
            );
            allIds.push(id);
          }
          if (transformer.termsExtractor !== undefined) {
            const termElements = await transformer.termsExtractor(doc);
            if (termElements) {
              allTerms = { ...allTerms, ...termElements };
            }
          }
        }
      }
    } catch (err) {
      console.error(`Error parsing line ${line}: ${err}`);
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
        source,
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
